import { Store, Config } from './../interface/Store';
import { getAccess, createDir, createFile, getDir } from '../utils';

class FileSystemStore implements Store {
    
  public async add(config: Config): Promise<void> {
    const folder = config?.folder;
    const subfolder = `${folder}/${config?.subfolder}`
    const filename = `${subfolder}/${config?.filename}`;
    const data = config?.data;
    let exists: boolean = await getAccess(folder);
    if (!exists) {
      await createDir(folder);
    }
    let existSubfolder: boolean = await getAccess(`${subfolder}`);
    if (!existSubfolder) {
      await createDir(subfolder);
    }
    await createFile(filename, data, 'binary');
  }

  public async get(config: Config): Promise<string | null> {
    const fileFolder = config?.fileFolder;
    const exists: boolean = await getAccess(fileFolder);
    let fileName: string = '';

    if (!exists) {
      return null;
    }

    const files = await getDir(fileFolder);
    files.forEach((file: string) => {
       fileName = file;
    });
    return `${fileFolder}/${fileName}`;    
  }

  public update(): any {
    console.log('update');
  }
}

export default FileSystemStore;