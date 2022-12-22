import { HydratedDocument, model, ObjectId, Schema } from 'mongoose';
import { UserInterface } from './User';

export interface NotificationInterface {
  _id: ObjectId;
  sms: boolean;
  email: boolean;
  push: boolean;
  phone: boolean;
  available: string;
  user: HydratedDocument<UserInterface> | ObjectId;
}

export enum NotificationAvailability {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REFUSED = 'refused',
}

export const notificationSchema = new Schema<NotificationInterface>({
  sms: { type: Boolean, required: true, default: false },
  email: { type: Boolean, required: true, default: false },
  push: { type: Boolean, required: true, default: false },
  phone: { type: Boolean, required: true, default: false },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  available: {
    type: String,
    required: true,
    default: NotificationAvailability.PENDING,
  },
});

const Notification = model<NotificationInterface>(
  'Notification',
  notificationSchema,
);

export default Notification;
