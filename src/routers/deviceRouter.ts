import logger from '../utils/logger';
import User from '../entities/User';
import { Router } from 'express';
import { generateJWT } from '../utils/jwt';

const deviceRouter = Router();

deviceRouter.get('/check/:deviceId', async (req, res) => {
  const { deviceId } = req.params;
  const user = await User.findOne({ deviceId: deviceId });
  if (user) {
    const token = generateJWT(user._id.toString());
    return res.send({ token });
  }
  return res.status(404).send({ message: 'Device not found' });
});

deviceRouter.post('/register', async (req, res) => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not defined');
  const { registrationToken, deviceId } = req.body;
  logger.debug(
    `Registering user with token: ${registrationToken} and device id: ${deviceId}`,
  );
  const user = await User.findOne({ registrationToken });
  // TODO: Error handling!
  if (!user) {
    return res.status(404).send({ message: 'Not found' });
  }
  user.deviceId = deviceId;
  await user.save();
  const token = generateJWT(user._id.toString());
  return res.send({ token });
});

export default deviceRouter;
