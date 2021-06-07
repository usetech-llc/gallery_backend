import { Store, Config } from './../interface/Store';
import { access, constants, mkdir, writeFile, readdir } from 'fs';

class FileSystemStore implements Store {

  private getAcess(file: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      access(file, constants.F_OK, (err) => {
        if (err) {
          console.error(err);
          resolve(false);
        }
        resolve(true);
      })
    });
  }

  private createDir(file: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      mkdir(file, (err) => {
        if (err) {
          console.error(err);
          reject(false);
        }
        resolve(true);
      })
    })
  }

  private writeFile(file:string, data: any, options: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      writeFile(file, data, options, (err) => {
        if (err) {
          console.error(err);
          reject(false);
        }
        resolve(true);
      })
    })
  }

  private getDir(pathDir: string): Promise<any> {
    return new Promise((resolve, reject) => {
      readdir(pathDir, (err, files) => {
        if (err) reject(err);
        resolve(files);
      })
    })
  }


  public async add(config: Config): Promise<void> {
    const folder = config?.folder;
    const subfolder = `${folder}/${config?.subfolder}`
    const filename = `${subfolder}/${config?.filename}`;
    const data = config?.data;
    let exists: boolean = await this.getAcess(folder);
    if (!exists) {
      await this.createDir(folder);
    }
    let existSubfolder: boolean = await this.getAcess(`${subfolder}`);
    if (!existSubfolder) {
      await this.createDir(subfolder);
    }
    await this.writeFile(filename, data, 'binary');
  }

  public async get(config: Config): Promise<string | null> {
    const fileFolder = config?.fileFolder;
    const exists: boolean = await this.getAcess(fileFolder);
    let fileName: string = '';

    if (!exists) {
      return null;
    }

    const files = await this.getDir(fileFolder);
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