const bodyParser = require('body-parser');
const express = require('express');

const routes = require('./routes/routes');

const port = 3003;
const app = express();

  // Configure content security
const allowedOrigins = ['http://localhost:3000', 'https://uniqueapps.usetech.com'];
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true, parameterLimit: 5000 }));
app.use(bodyParser.json({ limit: '10mb', extended: true }));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Initializing routes.
routes(app);

app.listen(port, () => console.log(`App listening on port ${port}!`));
