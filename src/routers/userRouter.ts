import { Router } from 'express';
import User from '../entities/User';
import * as multer from 'multer';

const upload = multer({ dest: 'uploads/users' });

const userRouter = Router();

userRouter.get('/', async (req, res) => {
  const users = await User.find();

  res.send(users);
});

userRouter.post('/import', upload.single('csv'), async (req, res) => {
  res.send({ message: 'Imported' });
});

userRouter.get('/:id', async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
    });
    return res.send(user);
  } catch (error) {
    return res.status(404).send({ message: 'Not found' });
  }
});

export default userRouter;
