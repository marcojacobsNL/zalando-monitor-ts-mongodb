import chalk from 'chalk';
import Logger from './logger';
import { IStore } from '../models/Store';
import { Proxy } from '../models/Proxy';
import ZalandoTask from '../task/zalando';
import { formatProxy } from '../util/proxy';

const log = new Logger();

interface Monitor {
  _store: IStore;
  _tasks: ZalandoTask[];
  _startTime: Date;
}

class Monitor {
  constructor(store: IStore) {
    // init vars
    this._tasks = [];
    this._store = store;
  }

  async init() {
    log.info(`Starting ${this._store.name} monitor with ${this._store.products.length} products`);
    if (this._store.products !== null) {
      this._store.products.forEach((product) => {
        this.startTask(product);
      });
    }
  }

  async startTask(product: string) {
    // Get all proxies from DB
    const proxies: string[] = [];
    const proxyObjects = await Proxy.find().then((objects) => {
      objects.forEach((proxy) => {
        proxies.push(formatProxy(proxy.proxy));
      });
    });
    const task: ZalandoTask = new ZalandoTask(product, this._store, proxies);
    this._tasks.push(task);
    task.init();
  }
}

export default Monitor;
