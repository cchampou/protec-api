import logger from './utils/logger';
import * as express from 'express';
import * as cors from 'cors';

import 'reflect-metadata';
import User from './entities/User';
import Database from './services/Database';
import * as bodyParser from 'body-parser';
import apiRouter from './routers';

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.use('/api', apiRouter);

const PORT = 3000;

(async () => {
  await Database.connect();
  app.listen(PORT, () => {
    logger.info('Server listening on port ' + PORT);
  });
})();
