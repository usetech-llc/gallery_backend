import { access, constants, mkdir, writeFile, readdir, readFile } from 'fs';

export function getAccess(file: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    access(file, constants.F_OK, (err) => {
      if (err) {
        console.error(err);
        resolve(false);
      }
      resolve(true);
    })
  })
}

export function getFile( file:string ): Promise<string | null> {
  return new Promise((resolve, reject) => {
    readFile(file, 'utf-8', (err, data) => {
      if (err) {
        console.error(err);
        resolve(null);
      }
      resolve(data);
    })
  })
}

export function createDir(file: string): Promise<boolean> {
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

export function createFile(file:string, data: any, options: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    writeFile(file, data, options, (err) => {
      if (err) {
        console.error(err);
        resolve(false);
      }
      resolve(true);
    })
  })
}

export function getDir(pathDir: string): Promise<any> {
  return new Promise((resolve, reject) => {
    readdir(pathDir, (err, files) => {
      if (err) reject(err);
      resolve(files);
    })
  })
}