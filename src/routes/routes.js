const nft = require('../controllers/nft');
const {Express} = require('express');

const urlPrefix = "";

const routes = (app) => {
    app.get(`${urlPrefix}/health`, nft.health);
    app.post(`${urlPrefix}/mint`, nft.mint);
};

module.exports = routes;