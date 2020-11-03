const bodyParser = require('body-parser');
const express = require('express');

const config = require('./config');
const routes = require('./routes/routes');

const port = 3003;
const app = express();

  // Configure content security
const allowedOrigins = ['http://localhost:3000', 'https://uniqueapps.usetech.com'];
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Initializing routes.
routes(app);

app.listen(port, () => console.log(`App listening on port ${port}!`));
