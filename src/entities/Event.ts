import mongoose, { Schema } from 'mongoose';

export interface EventInterface {
  title: string;
  eProtecLink: string;
  comment?: string;
  location: string;
  start: Date;
  end: Date;
}

const eventSchema = new Schema<EventInterface>({
  title: { type: String, required: true },
  eProtecLink: { type: String, required: true },
  comment: { type: String, required: false },
  location: { type: String, required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
});

const Event = mongoose.model<EventInterface>('Event', eventSchema);

export default Event;
