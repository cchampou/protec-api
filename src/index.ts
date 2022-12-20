import logger from './utils/logger';
import * as express from 'express';
import * as cors from 'cors';

import 'reflect-metadata';
import User from './entities/User';
import Database from './services/Database';
import * as bodyParser from 'body-parser';
import apiRouter from './routers';

const user = new User();
user.firstName = 'Clément';
user.lastName = 'Champouillon';
user.email = 'clement@champouillon.com';
user.phone = '1234567890';
user.hash = '123456';
user.deviceId = '';
user.registrationToken = '1234';
user
  .save()
  .then(() => {
    logger.info('User saved');
  })
  .catch((error) => {
    if (error.code === 11000) {
      logger.error('User already exists');
    }
  });

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
