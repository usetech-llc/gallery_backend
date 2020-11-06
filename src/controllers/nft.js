const { ApiPromise, WsProvider, Keyring } = require('api_v1');
const { Base64 } = require('js-base64');
const config = require('../config.js');
const rtt = require('../runtime_types.json');
const fs = require('fs');
const { Keccak } = require('sha3');
 

const folder = "images";
const fileprefix = "img";

let api;
async function getApi() {
  // Initialise the provider to connect to the node
  const wsProvider = new WsProvider(config.wsEndpoint);

  // Create the API and wait until ready
  const api = new ApiPromise({ 
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
    const unsub = await api.tx.nft
      .createItem(config.collectionId, nftMeta, newOwner)
      .signAndSend(admin, (result) => {
        console.log(`Current tx status is ${result.status}`);
    
        if (result.status.isInBlock) {
          console.log(`Transaction included at blockHash ${result.status.asInBlock}`);
        } else if (result.status.isFinalized) {
          console.log(`Transaction finalized at blockHash ${result.status.asFinalized}`);

          // Loop through Vec<EventRecord> to display all events
          let success = false;
          let id = 0;
          result.events.forEach(({ phase, event: { data, method, section } }) => {
            console.log(`    ${phase}: ${section}.${method}:: ${data}`);
            if (method == 'ExtrinsicSuccess') {
              success = true;
            }
            if (method == 'ItemCreated') {
              id = data[1];
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

function saveFile(filename, data) {
  if (!fs.existsSync(folder)){
    fs.mkdirSync(folder);
  }
  fs.writeFileSync(`${folder}/${filename}`, data, 'binary');
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
      if (!api) api = await getApi();

      // Get post parameters: File in base64 and token name
      try {
        const imageBase64 = req.body['image'];
        const imageName = req.body['name'];
        const newOwner = req.body['address'];
        const imageData = Buffer.from(imageBase64, 'base64').toString('binary');
        if ((imageBase64.length < 2) || (imageName.length == 0) || (imageName.length > 220) || (newOwner.length != 48)) {
          res.sendStatus(400);
          return;
        }
        console.log("Image base64 length: ", imageBase64.length);
        console.log("Image data length: ", imageData.length);

        // Calculate metadata
        const hash = new Keccak(256);
        hash.update(imageData);
        const imageHash = hash.digest('hex');
        const imageNameHex = Buffer.from(imageName, 'utf8').toString('hex');
        let nftMeta = `0x${imageHash}${imageNameHex}`;

        // Mint token in collection
        const keyring = new Keyring({ type: 'sr25519' });
        const owner = keyring.addFromUri(config.ownerSeed);
        const id = await mintAsync(api, owner, nftMeta, newOwner);

        // Save file
        saveFile(`${fileprefix}${id}`, imageData);

        // Send response
        res.setHeader('Content-Type', 'application/json');
        res.send(`{id: ${id}}`);
      }
      catch (e) {
        console.log("Request error: ", e);
        res.sendStatus(400);
        return;
      }
    },
    get: async (req, res) => {
      try {
        const id = req.params.id;
        const filePath = `${folder}/${fileprefix}${id}`;
        if (fs.existsSync(filePath)) {
          res.setHeader('Content-Type', '	image/jpeg');

          const fileData = fs.readFileSync(filePath);
          res.send(fileData);
        }
        else {
          res.sendStatus(404);
        }
      } catch (e) {
        console.log("get error: ", e);
        res.sendStatus(400);
      }

    },
};

module.exports = nftController;
