import { Store } from '../interface/Store';
import FileSystemStore from '../store/FileSystemStore';
import StoreHandler from './StoreHandler';

export class FileSystemHandler extends StoreHandler {
  
  public createStore(): Store {
    return new FileSystemStore();
  }
};