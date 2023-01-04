import logger from '../utils/logger';
import User from '../entities/User';
import { Router } from 'express';
import { generateJWT } from '../utils/jwt';
import ERRORS from '../constants/errors';
import {
  defaultNotFoundResponse,
  UnifiedResponse,
  unifiedResponse,
} from '../utils/unifiedResponse';

const deviceRouter = Router();

deviceRouter.get(
  '/check/:deviceId',
  async (req, res): Promise<UnifiedResponse> => {
    const { deviceId } = req.params;
    const user = await User.findOne({ deviceId: deviceId });
    if (!user) return defaultNotFoundResponse(res);
    const token = generateJWT(user._id.toString());
    return unifiedResponse(res, { payload: { token } });
  },
);

deviceRouter.post('/register', async (req, res): Promise<UnifiedResponse> => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not defined');
  const { registrationToken, deviceId } = req.body;
  logger.debug(`Registering token ${registrationToken} deviceID ${deviceId}`);
  const user = await User.findOne({ registrationToken });
  if (!user) return defaultNotFoundResponse(res);
  user.deviceId = deviceId;
  try {
    await user.save();
    const token = generateJWT(user._id.toString());
    return unifiedResponse(res, {
      payload: { token },
    });
  } catch (error) {
    return unifiedResponse(res, {
      status: 500,
      message: error.message,
    });
  }
});

export default deviceRouter;
