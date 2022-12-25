import { config } from 'dotenv';

config({
  path: '.env.dev',
});

import logger from './utils/logger';
import * as express from 'express';
import * as cors from 'cors';

import 'reflect-metadata';
import Database from './services/Database';
import * as bodyParser from 'body-parser';
import apiRouter from './routers';

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'src/views');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.use('/api', apiRouter);
app.get('/emails/:templateId', (req, res) => {
  const { templateId } = req.params;
  res.render(`emails/${templateId}`, {
    downloadLink: 'test',
    registrationCode: 'test',
    url: 'test',
  });
});
const PORT = 3000;

(async () => {
  await Database.connect();
  app.listen(PORT, () => {
    logger.info('Server listening on port ' + PORT);
  });
})();
