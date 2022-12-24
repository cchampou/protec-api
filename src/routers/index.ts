import userRouter from './userRouter';
import { Router } from 'express';
import deviceRouter from './deviceRouter';
import eventRouter from './eventRouter';
import isAuthenticated from '../middlewares/auth';
import authRouter from './authRouter';

const apiRouter = Router();

apiRouter.use('/user', isAuthenticated, userRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/device', deviceRouter);
apiRouter.use('/event', isAuthenticated, eventRouter);

export default apiRouter;
