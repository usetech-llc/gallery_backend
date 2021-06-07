import nft from '../controllers/nft';
import {Express} from 'express';

const routes = (app: Express) => {
    app.get(`/health`, nft.health);
    app.post(`/mint`, nft.mint);
    app.get(`/metadata/:id`, nft.getmeta);
    //Configuration by server
    app.get('/confg', nft.getConfig);
    app.post('/config', nft.setConfig);
};

export default routes;
