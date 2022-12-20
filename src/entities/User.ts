import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema({
  lastName: { type: String, required: true },
  firstName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phone: { type: String, unique: true, required: true },
  hash: { type: String, select: false, required: false },
  deviceId: String,
  registrationToken: { type: String, required: true },
});

export interface UserInterface {
  lastName: string;
  firstName: string;
  email: string;
  phone: string;
  hash: string;
  deviceId: string;
  registrationToken: string;
}

const User = mongoose.model<UserInterface>('User', userSchema);

export default User;
