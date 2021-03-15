
const config = {
  wsEndpoint: process.env.UniqueEndpoint || 'wss://testnet2.uniquenetwork.io',
  ownerSeed: process.env.MINT_ADMIN_SEED || "//Alice",
  collectionId: process.env.MINT_COLLECTION_ID || 3,

  publicFolder: "public",
  imagesFolder: "images"
};

module.exports = config;