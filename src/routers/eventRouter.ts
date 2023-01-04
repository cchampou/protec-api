import { Request, Router } from 'express';
import Event from '../entities/Event';
import User, { UserInterface } from '../entities/User';
import Notifier from '../services/Notifier';
import Notification, {
  NotificationAvailability,
} from '../entities/Notification';
import { HydratedDocument } from 'mongoose';
import logger from '../utils/logger';
import { addSelfAvailability, addStatistics } from '../utils/event';
import ERRORS from '../constants/errors';
import {
  defaultInvalidRequestResponse,
  defaultNotFoundResponse,
  UnifiedResponse,
  unifiedResponse,
} from '../utils/unifiedResponse';
import MESSAGES from '../constants/messages';

const eventRouter = Router();

eventRouter.get('/', async (req, res) => {
  const events = await Event.find().sort({ start: -1 });
  if (typeof req.userId !== 'string')
    return res.status(401).send({ message: ERRORS.UNAUTHORIZED });
  const userId = req.userId;
  const eventsWithAvailability = events.map((event) =>
    addSelfAvailability(event, userId),
  );
  return unifiedResponse(res, {
    payload: eventsWithAvailability,
  });
});

eventRouter.get('/:id', async (req: Request, res): Promise<UnifiedResponse> => {
  try {
    const event = await Event.findOne({
      _id: req.params.id,
    }).populate('notifications.user');
    if (!event) throw new Error(ERRORS.ITEM_NOT_FOUND);
    if (!req.userId) throw new Error(ERRORS.UNAUTHORIZED);
    const eventWithSelfAvailability = addSelfAvailability(event, req.userId);
    const eventWithStats = addStatistics(eventWithSelfAvailability);
    return unifiedResponse(res, { payload: eventWithStats });
  } catch (error) {
    return defaultNotFoundResponse(res);
  }
});

eventRouter.post('/', async (req, res): Promise<UnifiedResponse> => {
  try {
    const event = await Event.create(req.body);
    return unifiedResponse(res, {
      message: MESSAGES.EVENT_CREATED,
      payload: event,
    });
  } catch (error) {
    return defaultInvalidRequestResponse(res);
  }
});

eventRouter.post('/:id/answer', async (req, res): Promise<UnifiedResponse> => {
  const eventId = req.params.id;
  const deviceId = req.body.deviceId;
  const availability = req.body.availability;
  const event = await Event.findOne({ _id: eventId }).populate(
    'notifications.user',
  );
  if (!event) return defaultNotFoundResponse(res);
  let notificationDocument = event.notifications.find(
    (notification) =>
      (notification.user as UserInterface).deviceId === deviceId,
  );
  if (!notificationDocument) {
    const user = await User.findOne({ deviceId });
    if (!user) return defaultNotFoundResponse(res);
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
  return res.send({ message: 'Notification updated' });
});

eventRouter.post(
  '/:id/notify/:mode',
  async (req, res): Promise<UnifiedResponse> => {
    const eventId = req.params.id;
    const mode = req.params.mode;
    if (
      mode !== 'email' &&
      mode !== 'push' &&
      mode !== 'phone' &&
      mode !== 'sms'
    )
      return unifiedResponse(res, {
        status: 400,
        message: ERRORS.NOTIFICATION_MODE_UNKNOWN,
      });
    const notifier = new Notifier({
      mode,
      eventId,
    });
    const users: HydratedDocument<UserInterface>[] = await User.find();
    const event = await Event.findOne({ _id: eventId }).populate(
      'notifications',
    );
    if (!event) return defaultNotFoundResponse(res);
    const notified = await Promise.all(
      users.map(async (user): Promise<boolean> => {
        try {
          await notifier.notify(user, event);
          const existingNotification = event.notifications.find(
            (notification) =>
              notification.user.toString() === user._id.toString(),
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
        } catch (e) {
          logger.error(e.message);
          return false;
        }
      }),
    );
    const notifiedCount = notified.filter((n) => n).length;
    logger.info('All notifications sent, saving event');
    await event.save();
    return unifiedResponse(res, {
      message: `${notifiedCount} secouristes ont été notifiés.`,
    });
  },
);

export default eventRouter;
