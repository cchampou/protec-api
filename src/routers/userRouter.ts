import { Router } from 'express';
import User, { UserInterface } from '../entities/User';
import * as multer from 'multer';
import { parse } from 'csv-parse/sync';
import Email from '../services/Email';
import logger from '../utils/logger';
import { render } from 'ejs';
import { readFileSync } from 'fs';
import ERRORS from '../constants/errors';
import {
  defaultInvalidRequestResponse,
  defaultNotFoundResponse,
  UnifiedResponse,
  unifiedResponse,
} from '../utils/unifiedResponse';
import MESSAGES from '../constants/messages';

const upload = multer({ dest: 'uploads/users' });

const userRouter = Router();

userRouter.get('/', async (req, res): Promise<UnifiedResponse> => {
  const users = await User.find();

  return unifiedResponse<UserInterface[]>(res, { payload: users });
});

userRouter.get('/:id', async (req, res): Promise<UnifiedResponse> => {
  const user = await User.findOne({
    _id: req.params.id,
  });
  if (!user) return res.status(404).send({ message: ERRORS.ITEM_NOT_FOUND });
  return unifiedResponse<UserInterface>(res, {
    payload: user,
  });
});

userRouter.post('/', async (req, res): Promise<UnifiedResponse> => {
  try {
    const user = await User.create(req.body);
    return unifiedResponse<UserInterface>(res, {
      message: MESSAGES.USER_CREATED,
      payload: user,
    });
  } catch (error) {
    return defaultInvalidRequestResponse(res);
  }
});

userRouter.post('/:id/invite', async (req, res): Promise<UnifiedResponse> => {
  const user = await User.findOne({ _id: req.params.id });

  if (!user) return defaultNotFoundResponse(res);

  const templatePath = 'src/views/emails/invite.ejs';
  try {
    await Email.sendEmail(
      user.email,
      render(readFileSync(templatePath, 'utf8'), {
        filename: templatePath,
        downloadLink:
          'https://play.google.com/apps/internaltest/4701694566417020121',
        registrationCode: user.registrationToken,
      }),
    );
    return unifiedResponse(res, { message: MESSAGES.USER_INVITED });
  } catch (error) {
    return unifiedResponse(res, { status: 500, message: error.message });
  }
});

userRouter.patch('/:userId', async (req, res) => {
  const { userId } = req.params;
  if (!userId) return defaultInvalidRequestResponse(res);
  const user = await User.findOne({ _id: userId });
  if (!user) return defaultNotFoundResponse(res);

  try {
    await User.updateOne({ _id: userId }, req.body);
    return unifiedResponse(res, {
      message: MESSAGES.USER_UPDATED,
      payload: user,
    });
  } catch (error) {
    return unifiedResponse(res, {
      message: ERRORS.USER_DUPLICATE,
    });
  }
});

userRouter.post('/import', upload.single('csv'), async (req, res) => {
  if (!req.file)
    return res.status(400).send({ message: ERRORS.INVALID_REQUEST });

  let uploadedUsersCount = 0;
  try {
    const csvContent = readFileSync(req.file.path, 'utf8');
    const parsed = parse(csvContent, { columns: true });
    await Promise.all(
      parsed.map(async (user: Partial<UserInterface>) => {
        try {
          await User.create(user);
          uploadedUsersCount++;
        } catch (e) {
          logger.error(e);
        }
      }),
    );
    res.send({ message: `${uploadedUsersCount} utilisateurs importés` });
  } catch (error) {
    logger.error(error);
    res.status(400).send({
      message: ERRORS.INVALID_REQUEST,
    });
  }
});

export default userRouter;
