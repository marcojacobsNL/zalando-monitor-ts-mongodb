import express from 'express';
import Logger from './service/logger';
import { Store, IStore } from './models/Store';
import Monitor from './service/monitor';

import { connectDatabase } from './service/database';

// Logger initialization
const log = new Logger();

// Express intiialization
const app = express();

const port: number = Number(process.env.PORT) || 8080;

/**
 * Start monitor
 */
const startMonitor = async () => {
  try {
    // Use express, mandatory for Heroku.
    app.listen(port);
    log.success(`Express listening on ${port}`);
    // Find all active monitors
    const stores = await Store.find({ active: true, type: 'zalando' });
    stores.forEach((store) => {
      // Init store monitor
      const storeM = new Monitor(store as IStore);
      storeM.init();
    });
  } catch (err) {
    log.error(`Express error: ${err}`);
  }
};

(async () => {
  await connectDatabase();
  await startMonitor();
})();
