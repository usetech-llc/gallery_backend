import { Config, Store } from '../interface/Store';

abstract class StoreHandler {
  public abstract createStore(config?: Config): Store;  

  public getStore(): Store {
    return this.createStore();    
  }
}

export default StoreHandler;