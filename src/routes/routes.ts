import nft from '../controllers/nft';
import {Express} from 'express';

const routes = (app: Express) => {
    app.get(`/health`, nft.health);
    app.post(`/mint`, nft.mint);
    app.get(`/metadata/:id`, nft.getmeta);
    
    //Configuration by server
    app.get('/config', nft.getConfig);  
    
    app.get('/whoam', nft.whoAm);
};

export default routes;
