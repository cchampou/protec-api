import { Router } from 'express';
import Event from '../entities/Event';
import User, { UserInterface } from '../entities/User';
import Notifier from '../services/Notifier';
import Notification, {
  NotificationAvailability,
} from '../entities/Notification';
import { HydratedDocument } from 'mongoose';

const eventRouter = Router();

eventRouter.get('/', async (req, res) => {
  const events = await Event.find();

  res.send(events);
});

eventRouter.get('/:id', async (req, res) => {
  try {
    const event = await Event.findOne({
      _id: req.params.id,
    }).populate('notifications.user');
    if (!event) throw new Error('Not found');

    return res.send(event);
  } catch (error) {
    return res.status(404).send({ message: 'Not found' });
  }
});

eventRouter.post('/', async (req, res) => {
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
  console.log('deviceId', deviceId);
  console.log('availability', availability);
  console.log('eventId', eventId);
  const event = await Event.findOne({ _id: eventId }).populate(
    'notifications.user',
  );
  if (!event) {
    return res.status(404).send({ message: 'Not found' });
  }
  const notificationDocument = event.notifications.find(
    (notification) =>
      (notification.user as UserInterface).deviceId === deviceId,
  );
  console.log('notificationDocument', notificationDocument);
  if (!notificationDocument) {
    return res.status(404).send({ message: 'Not found' });
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
  users.map(async (user) => {
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
    notifier.notify(user, event);
  });
  await event.save();
  res.send({ message: 'Notification sent' });
});

export default eventRouter;
