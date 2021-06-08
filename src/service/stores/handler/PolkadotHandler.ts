import { Store, Config } from '../interface/Store';
import PolkadotStore from '../store/PolkadotStore';
import StoreHandler from './StoreHandler';


export class PolkadotHandler extends StoreHandler {
  public createStore(config: Config): Store {
    return new PolkadotStore( config );
  }
}