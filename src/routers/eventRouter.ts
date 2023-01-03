import { Request, Router } from 'express';
import Event from '../entities/Event';
import User, { UserInterface } from '../entities/User';
import Notifier from '../services/Notifier';
import Notification, {
  NotificationAvailability,
} from '../entities/Notification';
import { HydratedDocument } from 'mongoose';
import isAuthenticated from '../middlewares/auth';
import logger from '../utils/logger';
import { addSelfAvailability, addStatistics } from '../utils/event';

const eventRouter = Router();

eventRouter.get('/', async (req, res) => {
  const events = await Event.find().sort({ start: -1 });
  if (typeof req.userId !== 'string')
    return res.status(401).send('Unauthorized');
  const userId = req.userId;

  return res.send(events.map((event) => addSelfAvailability(event, userId)));
});

eventRouter.get('/:id', isAuthenticated, async (req: Request, res) => {
  try {
    const event = await Event.findOne({
      _id: req.params.id,
    }).populate('notifications.user');
    if (!event) throw new Error('Not found');
    if (!req.userId) throw new Error('Unauthorized');
    const eventWithSelfAvailability = addSelfAvailability(event, req.userId);
    const eventWithStats = addStatistics(eventWithSelfAvailability);
    return res.send(eventWithStats);
  } catch (error) {
    return res.status(404).send({ message: 'Not found' });
  }
});

eventRouter.post('/', isAuthenticated, async (req, res) => {
  try {
    const event = await Event.create(req.body);
    res.send(event);
  } catch (error) {
    return res.status(400).send(error);
  }
});

eventRouter.post('/:id/answer', async (req, res) => {
  const eventId = req.params.id;
  const deviceId = req.body.deviceId;
  const availability = req.body.availability;
  const event = await Event.findOne({ _id: eventId }).populate(
    'notifications.user',
  );
  if (!event) {
    return res.status(404).send({ message: 'Not found' });
  }
  let notificationDocument = event.notifications.find(
    (notification) =>
      (notification.user as UserInterface).deviceId === deviceId,
  );
  if (!notificationDocument) {
    const user = await User.findOne({ deviceId });
    if (!user) return res.status(404).send({ message: 'Not found' });
    notificationDocument = new Notification({
      user,
      available:
        availability === 'true'
          ? NotificationAvailability.ACCEPTED
          : NotificationAvailability.REFUSED,
    });
    event.notifications.push(notificationDocument);
  }
  notificationDocument.available =
    availability === 'true'
      ? NotificationAvailability.ACCEPTED
      : NotificationAvailability.REFUSED;
  await event.save();
  res.send({ message: 'Notification updated' });
});

eventRouter.post('/:id/notify/:mode', async (req, res) => {
  const eventId = req.params.id;
  const mode = req.params.mode;
  if (mode !== 'email' && mode !== 'push' && mode !== 'phone' && mode !== 'sms')
    return res.status(400).send({ message: 'Invalid mode' });
  const notifier = new Notifier({
    mode,
    eventId,
  });
  const users: HydratedDocument<UserInterface>[] = await User.find();
  const event = await Event.findOne({ _id: eventId }).populate('notifications');
  if (!event) return res.status(404).send({ message: 'Event not found' });
  const notified = await Promise.all(
    users.map(async (user): Promise<boolean> => {
      try {
        await notifier.notify(user, event);
      } catch (e) {
        logger.error(e.message);
        return false;
      }
      const existingNotification = event.notifications.find(
        (notification) => notification.user.toString() === user._id.toString(),
      );
      if (existingNotification) {
        existingNotification[mode] = true;
      } else {
        const notification = await new Notification({
          user,
          [mode]: true,
        });
        event.notifications.push(notification);
      }
      return true;
    }),
  );
  const notifiedCount = notified.filter((n) => n).length;
  logger.info('All notifications sent, saving event');
  await event.save();
  res.send({ message: `${notifiedCount} secouristes ont été notifiés.` });
});

export default eventRouter;
