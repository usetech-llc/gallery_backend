import { Store, Config } from "../interface/Store";
import JSONStore from "../store/JSONStore";
import StoreHandler from "./StoreHandler";

class JSONHandler extends StoreHandler {
  public createStore(config?: Config): Store {
    return new JSONStore();
  }
}
export default JSONHandler;