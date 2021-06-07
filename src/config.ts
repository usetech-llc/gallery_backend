import process from 'process';

const config = {
  wsEndpoint: process.env.UniqueEndpoint || 'ws://localhost:9944',
  ownerSeed: process.env.MINT_ADMIN_SEED || "//Alice",
  collectionId: process.env.MINT_COLLECTION_ID || 1,

  publicFolder: "public",
  imagesFolder: "images"
};

export default config;