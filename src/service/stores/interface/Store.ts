export interface Config {
  [key: string]: any;
}

export interface Store {
  add(config: Config): void;
  get(config: Config): any;
  update(): void;
}