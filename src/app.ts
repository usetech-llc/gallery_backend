import bodyParser from 'body-parser';
import express from 'express';
import config from './config';
import routes from './routes/routes';
import fs  from 'fs';

const port = 3003;
const app = express();

  // Configure content security
const allowedOrigins = ['http://localhost', 'http://localhost:3000', 'https://marketplace.uniquenetwork.io'];
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true, parameterLimit: 5000 }));
app.use(bodyParser.json({ limit: '10mb' }));
app.use((req: any, res: any, next: any) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Serve images statically
if (!fs.existsSync(`${config.publicFolder}`)){
  fs.mkdirSync(`${config.publicFolder}`);
}
if (!fs.existsSync(`${config.publicFolder}/${config.imagesFolder}`)){
  fs.mkdirSync(`${config.publicFolder}/${config.imagesFolder}`);
}
app.use(express.static(config.publicFolder));

// Initializing routes.
routes(app);

console.log("Starting Mint Service");
console.log(`  config.wsEndpoint = ${config.wsEndpoint}`);
console.log(`  config.ownerSeed = ${config.ownerSeed.substr(0, 5)}...`);
console.log(`  config.collectionId = ${config.collectionId}`);

app.listen(port, () => console.log(`App listening on port ${port}!`));
