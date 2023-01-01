import { HydratedDocument } from 'mongoose';
import { UserInterface } from '../entities/User';
import { EventInterface } from '../entities/Event';
import { NotificationAvailability } from '../entities/Notification';

export const addSelfAvailability = (
  event: HydratedDocument<EventInterface>,
  userId: string,
): EventInterface & { selfAvailability: string } => {
  const notification = event.notifications.find(
    (notification) =>
      (notification.user as HydratedDocument<UserInterface>)._id.toString() ===
      userId,
  );
  const selfAvailability = notification ? notification.available : 'pending';
  return {
    ...event.toObject(),
    selfAvailability: selfAvailability,
  };
};

type EventWithStatsInterface = EventInterface & {
  accepted: number;
  refused: number;
  pending: number;
};

export const addStatistics = (
  event: EventInterface,
): EventWithStatsInterface => {
  const accepted = event.notifications.filter(
    (notification) =>
      notification.available === NotificationAvailability.ACCEPTED,
  ).length;
  const refused = event.notifications.filter(
    (notification) =>
      notification.available === NotificationAvailability.REFUSED,
  ).length;
  const pending = event.notifications.filter(
    (notification) =>
      notification.available === NotificationAvailability.PENDING,
  ).length;
  return {
    ...event,
    accepted,
    refused,
    pending,
  };
};
