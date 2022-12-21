import userRouter from './userRouter';
import { Router } from 'express';
import Database from '../services/Database';
import User, { UserInterface } from '../entities/User';
import Firebase from '../services/Firebase';
import deviceRouter from './deviceRouter';
import eventRouter from './eventRouter';

const apiRouter = Router();

apiRouter.use('/user', userRouter);
apiRouter.use('/device', deviceRouter);
apiRouter.use('/event', eventRouter);

apiRouter.post('/notify', async (req, res) => {
  const users: UserInterface[] = await User.find();
  users.map((user) => {
    Firebase.sendNotification(user.deviceId);
  });
  res.send({ message: 'Notification sent' });
});

export default apiRouter;
