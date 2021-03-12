const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');
const config = require('../config.js');
const rtt = require('../runtime_types.json');
const fs = require('fs');
const { Keccak } = require('sha3');
const Mutex = require('async-mutex').Mutex;
const { release } = require('os');
const mutex = new Mutex();

const folder = "images";

let api;
async function getApi() {
  // Initialise the provider to connect to the node
  const wsProvider = new WsProvider(config.wsEndpoint);

  // Create the API and wait until ready
  let api = new ApiPromise({ 
    provider: wsProvider,
    types: rtt
  });

  api.on('disconnected', async (value) => {
    console.log(`disconnected: ${value}`);
    api = null;
  });
  api.on('error', async (value) => {
    console.log(`error: ${value.toString()}`);
    api = null;
  });

  await api.isReady;

  return api;
}

function mintAsync(api, admin, nftMeta, newOwner) {
  return new Promise(async function(resolve, reject) {
    const createData = {nft: {const_data: nftMeta, variable_data: []}};
    const unsub = await api.tx.nft
      .createItem(config.collectionId, newOwner, createData)
      .signAndSend(admin, (result) => {
        console.log(`Current tx status is ${result.status}`);
    
        if (result.status.isInBlock) {
          console.log(`Transaction included at blockHash ${result.status.asInBlock}`);
        // } else if (result.status.isFinalized) {
        //   console.log(`Transaction finalized at blockHash ${result.status.asFinalized}`);

          // Loop through Vec<EventRecord> to display all events
          let success = false;
          let id = 0;
          result.events.forEach(({ phase, event: { data, method, section } }) => {
            console.log(`    ${phase}: ${section}.${method}:: ${data}`);
            if (method == 'ItemCreated') {
              success = true;
              id = parseInt(data[1].toString());
            }
          });

          if (success) resolve(id);
          else {
            reject("Transaction failed");
          }
          unsub();

          resolve();
          unsub();
        }
      });
  });
}

function saveFile(subfolder, filename, data) {
  if (!fs.existsSync(`${folder}/${subfolder}`)){
    fs.mkdirSync(`${folder}/${subfolder}`);
  }
  fs.writeFileSync(`${folder}/${subfolder}/${filename}`, data, 'binary');
}

const nftController = {
    health: async (req, res) => {
      let conn = true;
      try {
        if (!api) api = await getApi();
      }
      catch (e) {
        console.log("ERROR: ", e);
        conn = false;
      }

      const status = {
          connected: conn,
      };
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(status));
    },
    mint: async (req, res) => {
      // Do strictly one at a time
      const release = await mutex.acquire();

      if (!api) api = await getApi();

      // Get post parameters: File in base64, token name, and file name
      try {
        const imageBase64 = req.body['image'];
        const imageName = req.body['name'];
        const newOwner = req.body['address'];
        const fileName = req.body['filename'];
        const imageData = Buffer.from(imageBase64, 'base64').toString('binary');
        if ((imageBase64.length < 2) || (imageName.length == 0) || (imageName.length > 220) || (newOwner.length != 48) || (fileName.length < 1)) {
          res.sendStatus(400);
          return;
        }
        console.log("Image base64 length: ", imageBase64.length);
        console.log("Image data length: ", imageData.length);
        console.log("Image file name: ", fileName);

        // Calculate metadata
        const hash = new Keccak(256);
        hash.update(imageData);
        const imageHash = hash.digest('hex');
        const imageNameHex = Buffer.from(imageName, 'utf8').toString('hex');
        let nftMeta = `0x${imageHash}${imageNameHex}`;

        // Mint token in collection
        const keyring = new Keyring({ type: 'sr25519' });
        const admin = keyring.addFromUri(config.ownerSeed);
        console.log("Mint adming: ", admin.address.toString());
        const id = await mintAsync(api, admin, nftMeta, newOwner);

        // Save file
        saveFile(`${id}`, fileName, imageData);

        // Send response
        res.setHeader('Content-Type', 'application/json');
        res.send(`{id: ${id}}`);
      }
      catch (e) {
        console.log("Request error: ", e);
        res.sendStatus(400);
        return;
      }
      finally {
        release();
      }
    },
    getmeta: async (req, res) => {
      try {
        const id = req.params.id;
        const fileFolder = `${folder}/${id}`;
        let fileName = '';
        const hostname = req.headers.host;

        if (!fs.existsSync(fileFolder)) {
          res.sendStatus(404);
        }
        else {
          fs.readdirSync(fileFolder).forEach(file => {
            fileName = file;
            console.log(file);
          });          
          const filePath = `${fileFolder}/${fileName}`;
          console.log(`fileName found: ${filePath}`);
  
          if (fs.existsSync(filePath)) {
            res.setHeader('Content-Type', 'application/json');

            const imagePath = `${hostname}/${id}/${fileName}`;
            const response = {
              image: imagePath
            }

            res.send(JSON.stringify(response));
          }
          else {
            res.sendStatus(404);
          }
        }

      } catch (e) {
        console.log("get error: ", e);
        res.sendStatus(400);
      }

    },
};

module.exports = nftController;
