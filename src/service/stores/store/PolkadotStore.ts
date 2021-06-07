import { IKeyringPair } from '@polkadot/types/types';
import { TypeRegistry } from '@polkadot/types/create';
import { Struct, Bytes } from '@polkadot/types';
import { Keccak } from 'sha3';
import {Config, Store} from './../interface/Store';
import { ApiPromise, WsProvider, Keyring } from '@polkadot/api';

class PolkadotStore implements Store {
  
  private api: Promise<ApiPromise | null >;

  private registry = new TypeRegistry();

  public constructor(config: Config) {     
    this.api = new Promise((resolve, reject) => {
      const wsProvider = new WsProvider(config.wsEndpoint);
      let api: ApiPromise = new ApiPromise({
        provider: wsProvider,
        types: config.rtt
      });      
      api.on('disconnected', async (value) => {
        console.log(`disconnected: ${value}`);
        process.exit(1);
      });
      api.on('error', async (value) => {
        console.log(`error: ${JSON.stringify(value)}`);
        process.exit(1);
      });

      resolve(api.isReady);
    });  
  }

  private encodeScale(params: any): Uint8Array {
    const s = new Struct(this.registry, {
      NameStr: Bytes,
      ImageHash: Bytes,
    }, params);
  
    return s.toU8a();
  }
  /**
   * 
   * @param api 
   * @param admin 
   * @param nftMeta 
   * @param newOwner 
   * @param collectionId 
   * @returns 
   */
  private mintAsync(api: ApiPromise, admin: IKeyringPair, nftMeta: Uint8Array, newOwner: string, collectionId: number) {
    return new Promise(async function(resolve, reject) {
      const createData = {nft: {const_data: Array.from(nftMeta), variable_data: []}};
      const unsub = await api.tx.nft
      .createItem(collectionId, newOwner, createData)
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
  /**
   * 
   * @param config { ownerSeed, name, image }
   */
  public async add(config: Config): Promise< string | null > {
    const imageData = Buffer.from(config.image, 'base64').toString('binary');
    const hash = new Keccak(256);
    hash.update(imageData);
    console.log(hash.digest());

    let nftMeta = {
      NameStr: config.name,
      ImageHash: hash.digest().values()
    };
    let metaScale: Uint8Array = this.encodeScale(nftMeta);
    console.log(`Token metadata: ${metaScale.toString()}`);
    const keyring = new Keyring({ type: 'sr25519' });
    const admin = keyring.addFromUri(config.ownerSeed);
    console.log("Mint adming: ", admin.address.toString());

    console.log('add');
    return imageData;
  }

  public async get(): Promise<ApiPromise | null> {
    const _api = await this.api;
    return _api;
  }

  public update(): any {
    console.log('update');
  }
}

export default PolkadotStore;