const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');
const config = require('./config');
var BigNumber = require('bn.js');
const fs = require('fs');

function submitTransaction(sender, transaction) {
  return new Promise(async function(resolve, reject) {
    try {
      const unsub = await transaction
      .signAndSend(sender, (result) => {
        console.log(`Current tx status is ${result.status}`);
    
        if (result.status.isInBlock) {
          console.log(`Transaction included at blockHash ${result.status.asInBlock}`);
          resolve();
          unsub();
        } else if (result.status.isFinalized) {
          console.log(`Transaction finalized at blockHash ${result.status.asFinalized}`);
          resolve();
          unsub();
        }
      });
    }
    catch (e) {
      reject(e.toString());
    }
  });
}

async function createCollectionAsync(api, alice) {
  // "Unique Gallery"
  const name = [0x55, 0x6e, 0x69, 0x71, 0x75, 0x65, 0x20, 0x47, 0x61, 0x6c, 0x6c, 0x65, 0x72, 0x79];
  // "The NFT collection for artists to mint and display their work"
  const description = [0x54, 0x68, 0x65, 0x20, 0x4e, 0x46, 0x54, 0x20, 0x63, 0x6f, 0x6c, 0x6c, 0x65, 0x63, 0x74, 0x69, 0x6f, 0x6e, 0x20, 0x66, 0x6f, 0x72, 0x20, 0x61, 0x72, 0x74, 0x69, 0x73, 0x74, 0x73, 0x20, 0x74, 0x6f, 0x20, 0x6d, 0x69, 0x6e, 0x74, 0x20, 0x61, 0x6e, 0x64, 0x20, 0x64, 0x69, 0x73, 0x70, 0x6c, 0x61, 0x79, 0x20, 0x74, 0x68, 0x65, 0x69, 0x72, 0x20, 0x77, 0x6f, 0x72, 0x6b];
  // "GAL"
  const tokenPrefix = [0x47, 0x41, 0x4c];
  
  // Mode: NFT
  const tx = api.tx.nft.createCollection(name, description, tokenPrefix, {"NFT": config.collectionDataSize});
  await submitTransaction(alice, tx);
}

async function main() {
  // Initialise the provider to connect to the node
  const wsProvider = new WsProvider(config.wsEndpoint);
  const rtt = JSON.parse(fs.readFileSync("runtime_types.json"));

  // Create the API and wait until ready
  const api = await ApiPromise.create({ 
    provider: wsProvider,
    types: rtt
  });

  // Owners's keypair
  const keyring = new Keyring({ type: 'sr25519' });
  const owner = keyring.addFromUri(config.ownerSeed);
  console.log("Collection owner address: ", owner.address);  

  // Create collection as owner
  // console.log("=== Create collection ===");
  // await createCollectionAsync(api, owner);

  // Set offchain schema
  const collectionId = 14;
  const tx2 = api.tx.nft.setOffchainSchema(collectionId, "https://uniqueapps.usetech.com/api/images/{id}");
  await submitTransaction(owner, tx2);

}

main().catch(console.error).finally(() => process.exit());
