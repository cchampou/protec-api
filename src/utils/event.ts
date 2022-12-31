import { HydratedDocument } from 'mongoose';
import { UserInterface } from '../entities/User';
import { EventInterface } from '../entities/Event';

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
