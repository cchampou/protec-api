import logger from '../utils/logger';
import User from '../entities/User';
import Email from '../services/Email';
import { Request, Response, Router } from 'express';
import { readFileSync } from 'fs';
import { render } from 'ejs';
import { generateJWT } from '../utils/jwt';
import ERRORS from '../constants/errors';
import {
  defaultInvalidRequestResponse,
  defaultNotFoundResponse,
  UnifiedResponse,
  unifiedResponse,
} from '../utils/unifiedResponse';

const authRouter = Router();

if (!process.env.BASE_URL) {
  logger.error('BASE_URL is not defined');
}

authRouter.post('/recover', async (req: Request, res: Response) => {
  const { email } = req.body;
  logger.info('Recovering password for', email);
  const user = await User.findOne({
    email,
  });
  if (!user) return defaultNotFoundResponse(res);
  logger.debug('user found');
  user.generateRecoveryToken();
  await user.save();
  const templatePath = 'src/views/emails/reset.ejs';
  const template = readFileSync(templatePath, 'utf8');

  await Email.sendEmail(
    email,
    render(template, {
      filename: templatePath,
      url: `${process.env.BASE_URL}/password/${user.recoveryToken}`,
    }),
  );
  return unifiedResponse(res, {
    message: 'Mail envoyé',
  });
});

authRouter.post('/reset', async (req, res) => {
  const { token, password } = req.body;
  logger.info('Resetting password for', token);
  const user = await User.findOne({
    recoveryToken: token,
  });
  if (!user) return defaultNotFoundResponse(res);
  logger.debug('user found');
  user.generateHashAndSalt(password);
  await user.save();
  return unifiedResponse(res, {
    message: 'Nouveau mot de passe sauvegardé avec succès',
  });
});

authRouter.post('/login', async (req, res): Promise<UnifiedResponse> => {
  const { email, password } = req.body;
  if (!email || !password) return defaultInvalidRequestResponse(res);
  const user = await User.findOne({
    email,
  }).select('+hash +salt');
  console.log(user);
  if (!user || !user.validPassword(password) || !user.isAdmin())
    return res.status(401).send({ message: ERRORS.INVALID_CREDENTIALS });
  const token = generateJWT(user._id.toString());
  return unifiedResponse(res, {
    message: 'Ok',
    payload: {
      token,
    },
  });
});

export default authRouter;
