import logger from './utils/logger';
import Firebase from './services/Firebase';
import * as express from 'express';
import * as cors from 'cors';

import 'reflect-metadata';
import User from './entities/User';
import Database from './services/Database';
import { MongoError, WriteError } from 'typeorm';
import { Response } from 'express';
import * as bodyParser from 'body-parser';

logger.info('Server started');

const user = new User();
user.firstName = 'Clément';
user.lastName = 'Champouillon';
user.email = 'clement@champouillon.com';
user.hash = '123456';
user.deviceId = '';
user.registrationToken = '1234';

Database.dataSource.then((dataSource) => {
  const userRepo = dataSource.getRepository(User);
  userRepo
    .save(user)
    .then(() => {
      logger.info('User saved');
    })
    .catch((error) => {
      logger.error('Failed to save user, code: ' + error.code.toString());
    });
});

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.post('/api/notify', async (req, res) => {
  const db = await Database.dataSource;
  const userRepo = db.getRepository(User);
  const users = await userRepo.find();
  users.map((user) => {
    Firebase.sendNotification(user.deviceId);
  });
  res.send({ message: 'Notification sent' });
});

app.get('/api/check/:deviceId', async (req, res) => {
  const deviceId = req.params.deviceId;
  const db = await Database.dataSource;
  const userRepo = db.getRepository(User);
  const user = await userRepo.findOneBy({ deviceId: deviceId });
  if (user) {
    return res.send({ message: 'Device found' });
  }
  return res.status(404).send({ message: 'Device not found' });
});

app.post('/api/register', async (req, res) => {
  // TODO: Validate request
  const registrationToken = req.body.registrationToken;
  const deviceId = req.body.deviceId;
  logger.debug(
    `Registering user with token: ${registrationToken} and device id: ${deviceId}`,
  );
  const db = await Database.dataSource;
  const userRepo = db.getRepository(User);
  const user = await userRepo.findOneBy({ registrationToken });
  // TODO: Error handling!
  if (!user) {
    return res.status(404).send({ message: 'Not found' });
  }
  user.deviceId = deviceId;
  await userRepo.save(user);
  res.send({ message: 'User registered' });
});

const PORT = 3000;

app.listen(PORT, () => {
  logger.info('Server listening on port ' + PORT);
});
