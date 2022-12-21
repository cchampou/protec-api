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

export default apiRouter;
