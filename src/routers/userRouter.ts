import { Router } from 'express';
import User, { UserInterface } from '../entities/User';
import * as multer from 'multer';
import { parse } from 'csv-parse/sync';
import Email from '../services/Email';
import logger from '../utils/logger';
import { render } from 'ejs';
import { readFileSync } from 'fs';

const upload = multer({ dest: 'uploads/users' });

const userRouter = Router();

userRouter.get('/', async (req, res) => {
  const users = await User.find();

  res.send(users);
});

userRouter.post('/:id/invite', async (req, res) => {
  const user = await User.findOne({ _id: req.params.id });

  if (!user) {
    return res.status(404).send('User not found');
  }

  const templatePath = 'src/views/emails/invite.ejs';
  await Email.sendEmail(
    user.email,
    render(readFileSync(templatePath, 'utf8'), {
      filename: templatePath,
      downloadLink:
        'https://play.google.com/apps/internaltest/4701694566417020121',
      registrationCode: user.registrationToken,
    }),
  );

  res.send(user);
});

userRouter.patch('/:userId', async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).send('Bad request');
  }
  const user = await User.findOne({ _id: userId });
  if (!user) {
    return res.status(404).send('User not found');
  }
  try {
    await User.updateOne({ _id: userId }, req.body);
    return res.status(200).send(user);
  } catch (error) {
    return res
      .status(400)
      .send({
        message:
          'Un utilisateur avec cet email ou ce numero de téléphone existe déjà.',
      });
  }
});

userRouter.post('/import', upload.single('csv'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: 'No file uploaded' });
  }
  try {
    const csvContent = readFileSync(req.file.path, 'utf8');
    const parsed = parse(csvContent, { columns: true });
    await Promise.all(
      parsed.map(async (user: Partial<UserInterface>) => {
        try {
          await User.create(user);
        } catch (e) {
          logger.error(e);
        }
        return;
      }),
    );
    res.send({ message: 'Imported' });
  } catch (error) {
    logger.error(error);
    res.status(400).send({
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
