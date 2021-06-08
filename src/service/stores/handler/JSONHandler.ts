import { Store } from "../interface/Store";
import JSONStore from "../store/JSONStore";
import StoreHandler from "./StoreHandler";

export class JSONHandler extends StoreHandler {
  public createStore(): Store {
    return new JSONStore();
  }
};