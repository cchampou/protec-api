import { Router } from 'express';
import User, { UserInterface } from '../entities/User';
import * as multer from 'multer';
import * as fs from 'fs';
import { parse } from 'csv-parse/sync';

const upload = multer({ dest: 'uploads/users' });

const userRouter = Router();

userRouter.get('/', async (req, res) => {
  const users = await User.find();

  res.send(users);
});

userRouter.post('/import', upload.single('csv'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: 'No file uploaded' });
  }
  try {
    const csvContent = fs.readFileSync(req.file.path, 'utf8');
    const parsed = parse(csvContent, { columns: true });
    await Promise.all(
      parsed.map(async (user: Partial<UserInterface>) => {
        return User.create(user);
      }),
    );
    res.send({ message: 'Imported' });
  } catch (error) {
    res
      .status(400)
      .send({
        message: "Erreur lors de l'import, cela peut-être dû à des doublons",
      });
  }
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
