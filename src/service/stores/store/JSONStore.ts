import { Config, Store } from '../interface/Store';
import { getAccess, createDir, createFile, getDir, getFile } from '../utils';

class JSONStore implements Store {

  private pathFile = `${process.cwd()}/config.json`;
  //private contentFile: Promise<string>;
  
  public async add(config: Config): Promise<any> {    
    const jsonConfig = JSON.parse(config.data || '[]');
    const configHost = {
        'host': config.hostname,
        'protocol': config.protocol
    };    
    jsonConfig.push(configHost);
    const writeConfig = JSON.stringify(jsonConfig);
    await createFile(this.pathFile, writeConfig, 'utf-8');
    return configHost;
  }

  public async get(): Promise<string | null> {
    const exists: boolean = await getAccess(this.pathFile);
    if (!exists) {
      const data = JSON.stringify([]);
      await createFile(this.pathFile, data, 'utf-8');
      return data;
    } else {
      const data = await getFile(this.pathFile);
      return data;
    }        
  }

  public async update(config: Config): Promise<void> {
    const writeConfig = JSON.stringify(config.data);
    await createFile(this.pathFile, writeConfig, 'utf-8');
  }
}

export default JSONStore;