import logger from '../utils/logger';
import User from '../entities/User';
import Email from '../services/Email';
import { sign } from 'jsonwebtoken';
import { Router } from 'express';

const authRouter = Router();

authRouter.post('/recover', async (req, res) => {
  const { email } = req.body;
  logger.info('Recovering password for', email);
  const user = await User.findOne({
    email,
  });
  if (user) {
    logger.debug('user found');
    user.generateRecoveryToken();
    await user.save();
    await Email.sendEmail(email, user.recoveryToken);
  } else {
    logger.debug('user not found');
  }
  res.send({ message: 'ok' });
});
authRouter.post('/reset', async (req, res) => {
  const { token, password } = req.body;
  logger.info('Resetting password for', token);
  const user = await User.findOne({
    recoveryToken: token,
  });
  if (user) {
    logger.debug('user found');
    user.generateHashAndSalt(password);
    await user.save();
  } else {
    return res.status(404).send({ message: 'Not found' });
  }
  return res.send({ message: 'ok' });
});

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).send({ message: 'Bad request' });
  const user = await User.findOne({
    email,
  }).select('+hash +salt');
  if (!user || !user.validPassword(password) || user.role !== 'admin')
    return res.status(401).send({ message: 'Email ou mot de passe incorrect' });
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }
  const token = sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
  return res.status(200).send({ token });
});

export default authRouter;
