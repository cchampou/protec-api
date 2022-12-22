import { HydratedDocument, model, ObjectId, Schema } from 'mongoose';
import { NotificationInterface, notificationSchema } from './Notification';

export interface EventInterface {
  _id: ObjectId;
  title: string;
  eProtecLink: string;
  comment?: string;
  location: string;
  start: Date;
  end: Date;
  notifications: HydratedDocument<NotificationInterface>[];
}

const eventSchema = new Schema<EventInterface>({
  title: { type: String, required: true },
  eProtecLink: { type: String, required: true },
  comment: { type: String, required: false },
  location: { type: String, required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  notifications: [notificationSchema],
});

const Event = model<EventInterface>('Event', eventSchema);

export default Event;
