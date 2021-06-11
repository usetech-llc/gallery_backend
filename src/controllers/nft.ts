import config from '../config';
import rtt from "../runtime_types.json";
import { Mutex } from 'async-mutex';
import { FileSystemHandler, PolkadotHandler, JSONHandler } from '../service/stores';
import { Request, Response } from 'express';

const mutex = new Mutex();

const folder = `${config.publicFolder}/${config.imagesFolder}`;
const fileSystem = (new FileSystemHandler()).getStore();
const polkadotSystem = (new PolkadotHandler().createStore({
  wsEndpoint: config.wsEndpoint,
  rtt: rtt,
}));
const jsonSystem = (new JSONHandler()).getStore();


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

      try {
        const {image, name, address, filename} = req.body;
        if ((image.length < 2) || (name.length == 0) || (name.length > 220) || (address.length != 48) || (filename.length < 1)) {
          res.sendStatus(400);
          return;
        }
        
        const imageData = Buffer.from(image, 'base64').toString('binary');        
      
        const id = await polkadotSystem.add({
          ownerSeed: config.ownerSeed,
          name,
          imageData,
          address,
          collectionId: config.collectionId
        });

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
        const data = await jsonSystem.get();
        const host = req.headers.host;      
        const jsonConfig = JSON.parse(data);
        const findConfig = jsonConfig.find((i:any) => i.host === host) || null;      

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
          const imagePath = `${findConfig !== null ? findConfig.protocol : 'https'}://${hostname}/${file}`;
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
    getConfig: async (req: any, res: any) => {
      const data = await jsonSystem.get();
      const host = req.headers.host;      
      const jsonConfig = JSON.parse(data);
      const findConfig = jsonConfig.find((i:any) => i.host === host) || {};      
      res.json(findConfig);
    },
    setConfig: async (req: any, res: any) => {
      const { protocol } = req.body;
      const data = await jsonSystem.get();
      const host = req.headers.host;      
      const jsonConfig = JSON.parse(data);
      const filterConfig = jsonConfig.filter((i:any) => i.host === host) || [];
      if (filterConfig.length === 0) {
        const added = await jsonSystem.add({
          hostname: host,
          protocol,
          data
        });
        res.json(added);
      } else {
        res.json({error: 'Can`t add a record since it exists'});
      }            
    },
    updateConfig: async (req: any, res: any) => {
      const { protocol } = req.body;
      const data = await jsonSystem.get();
      const host = req.headers.host;
      const jsonConfig = JSON.parse(data);
      const index = jsonConfig.findIndex((i:any) => i.host === host);
      jsonConfig[index].protocol = protocol;
      await jsonSystem.update({
        data: jsonConfig
      });
      res.json(jsonConfig[index]);
    },
    whoAm: (req: Request, res: Response) => {
      res.json({
        'host': req.headers.host
      })
    }
};

export default nftController;
