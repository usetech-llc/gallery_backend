import { Store } from '../interface/Store';

class JSONStore implements Store {
  public add(): void {
    console.log('add');
  }

  public get(): any {
    console.log('get');
  }

  public update(): any {
    
  }
}

export default JSONStore;