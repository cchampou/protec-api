import logger from './utils/logger';
import Firebase from './services/Firebase';
import * as express from 'express';
import * as cors from 'cors';

logger.info('Server started');

const app = express();

app.use(cors());

app.post('/api/notify', (req, res) => {
  Firebase.sendNotification();
  res.send({ message: 'Notification sent' });
});

const PORT = 3000;

app.listen(PORT, () => {
  logger.info('Server listening on port ' + PORT);
});
