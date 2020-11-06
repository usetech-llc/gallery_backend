const nft = require('../controllers/nft');
const {Express} = require('express');

const urlPrefix = '/api';

const routes = (app) => {
    app.get(`${urlPrefix}/health`, nft.health);
    app.post(`${urlPrefix}/mint`, nft.mint);
    app.get(`${urlPrefix}/images/:id`, nft.get);
};

module.exports = routes;
