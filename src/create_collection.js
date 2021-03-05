const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api');
const config = require('./config');
var BigNumber = require('bn.js');
const fs = require('fs');

function strToUTF16(str) {
  let buf = [];
  for (let i=0, strLen=str.length; i < strLen; i++) {
    buf.push(str.charCodeAt(i));
  }
  return buf;
}

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

async function createCollectionAsync(api, signer) {
  const name = "Unique Gallery";
  const description = "The NFT collection for artists to mint and display their work";
  const tokenPrefix = "GAL";
  const modeprm = {nft: null};
  
  const tx = api.tx.nft.createCollection(strToUTF16(name), strToUTF16(description), strToUTF16(tokenPrefix), modeprm);
  await submitTransaction(signer, tx);
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
  console.log("=== Create collection ===");
  await createCollectionAsync(api, owner);

  // // Set offchain schema
  // const collectionId = 14;
  // const tx2 = api.tx.nft.setOffchainSchema(collectionId, "https://uniqueapps.usetech.com/api/images/{id}");
  // await submitTransaction(owner, tx2);

}

main().catch(console.error).finally(() => process.exit());
