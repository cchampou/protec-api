import logger from '../utils/logger';
import User from '../entities/User';
import { Router } from 'express';

const deviceRouter = Router();

deviceRouter.get('/check/:deviceId', async (req, res) => {
  const { deviceId } = req.params;
  const user = await User.findOne({ deviceId: deviceId });
  if (user) {
    return res.send({ message: 'Device found' });
  }
  return res.status(404).send({ message: 'Device not found' });
});

deviceRouter.post('/register', async (req, res) => {
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
  res.send({ message: 'User registered' });
});

export default deviceRouter;
