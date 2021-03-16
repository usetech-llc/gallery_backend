import nft from '../controllers/nft';
import {Express} from 'express';

const routes = (app: Express) => {
    app.get(`/health`, nft.health);
    app.post(`/mint`, nft.mint);
    app.get(`/metadata/:id`, nft.getmeta);
};

export default routes;
