const nft = require('../controllers/nft');

const routes = (app) => {
    app.get(`/health`, nft.health);
    app.post(`/mint`, nft.mint);
    app.get(`/metadata/:id`, nft.getmeta);
};

module.exports = routes;
