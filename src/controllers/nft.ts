import { ApiPromise, WsProvider, Keyring } from '@polkadot/api';
import config from '../config';
import rtt from "../runtime_types.json";;
import { Keccak } from 'sha3';
import { Mutex } from 'async-mutex';
import { IKeyringPair } from '@polkadot/types/types';
import { Bytes, Struct } from '@polkadot/types';
import { TypeRegistry } from '@polkadot/types/create';
import { FileSystemHandler, PolkadotHandler } from '../service/stores';

const mutex = new Mutex();

const folder = `${config.publicFolder}/${config.imagesFolder}`;
const fileSystem = (new FileSystemHandler()).getStore();
const polkadotSystem = (new PolkadotHandler().createStore({
  wsEndpoint: config.wsEndpoint,
  rtt: rtt,
}));

let api: ApiPromise;
async function getApi(): Promise<ApiPromise> {
  // Initialise the provider to connect to the node
  const wsProvider = new WsProvider(config.wsEndpoint);

  // Create the API and wait until ready
  let api: ApiPromise = new ApiPromise({ 
    provider: wsProvider,
    types: rtt
  });

  api.on('disconnected', async (value) => {
    console.log(`disconnected: ${value}`);
    process.exit(1);
  });
  api.on('error', async (value) => {
    console.log(`error: ${value.toString()}`);
    process.exit(1);
  });

  await api.isReady;

  return api;
}


const registry = new TypeRegistry();

function encodeScale(params: any): Uint8Array {
  const s = new Struct(registry, {
    NameStr: Bytes,
    ImageHash: Bytes,
  }, params);

  return s.toU8a();
}

function mintAsync(api: ApiPromise, admin: IKeyringPair, nftMeta: Uint8Array, newOwner: string) {
  return new Promise(async function(resolve, reject) {
    const createData = {nft: {const_data: Array.from(nftMeta), variable_data: []}};
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
        }
      });
  });
}

const nftController = {
    health: async (req: any, res: any) => {            
      try {
        const isLive = await polkadotSystem.get({});        
        if (isLive !== null) {
          res.json({
            connected: true
          });
        } else {
          res.json({
            connected: false
          });
        }                
      }
      catch (e) {
        console.log("ERROR: ", e);
        res.json({
          connect: false,
          ...e,
        })
      }
    },
    mint: async (req: any, res: any) => {
      // Do strictly one at a time
      const release = await mutex.acquire();

      if (!api) api = await getApi();

      // Get post parameters: File in base64, token name, and file name
      try {
        const {image, name, address, filename} = req.body;
        if ((image.length < 2) || (name.length == 0) || (name.length > 220) || (address.length != 48) || (filename.length < 1)) {
          res.sendStatus(400);
          return;
        }
        
        const imageData = Buffer.from(image, 'base64').toString('binary');        

        // Calculate metadata
        const hash = new Keccak(256);
        hash.update(imageData);
        console.log(hash.digest());

        let nftMeta = {
          NameStr: name,
          ImageHash: hash.digest().values()
        };
        let metaScale: Uint8Array = encodeScale(nftMeta);
        console.log(`Token metadata: ${metaScale.toString()}`);

        // Mint token in collection
        const keyring = new Keyring({ type: 'sr25519' });
        const admin = keyring.addFromUri(config.ownerSeed);
        console.log("Mint adming: ", admin.address.toString());
        const id = await mintAsync(api, admin, metaScale, address);

        await fileSystem.add({
          folder,
          subfolder: id,
          filename,
          data: imageData
        });

        // Send response
        res.setHeader('Content-Type', 'application/json');
        res.send(`{id: ${id}}`);
      }
      catch (e) {
        console.log("Request error: ", e);
        console.log(e);
        res.sendStatus(400);
        return;
      }
      finally {
        release();
      }
    },
    getmeta: async (req: any, res: any) => {
      try {
        const id = req.params.id;
        const file = await fileSystem.get({
          fileFolder: `${folder}/${id}`
        });
        const hostname = req.headers.host;

        if (file === null) {
          res.sendStatus(404);
        } else {
          console.log(`fileName found: ${file}`);
          res.setHeader('Content-Type', 'application/json');
          const imagePath = `http://${hostname}/${file}`;
          const response = {
              image: imagePath
          }
          res.json(response);
        }
      } catch (e) {
        console.log("get error: ", e);
        res.sendStatus(400);
      }
    },
    getConfig: (req: any, res: any) => {
      res.json({});
    },
    setConfig: (req: any, res: any) => {
      res.json({})
    }
};

export default nftController;
