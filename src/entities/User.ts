import mongoose, { ObjectId, Schema } from 'mongoose';

export interface UserInterface {
  _id: ObjectId;
  lastName: string;
  firstName: string;
  email: string;
  phone: string;
  hash: string;
  deviceId: string;
  registrationToken: string;
}

const userSchema = new Schema<UserInterface>({
  lastName: { type: String, required: true },
  firstName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phone: { type: String, unique: true, required: true },
  hash: { type: String, select: false, required: false },
  deviceId: String,
  registrationToken: {
    type: String,
    required: true,
    default: () => Math.floor(100000 + Math.random() * 900000).toString(),
  },
});

const User = mongoose.model<UserInterface>('User', userSchema);

export default User;
