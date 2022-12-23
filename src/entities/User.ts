import mongoose, { Model, ObjectId, Schema } from 'mongoose';
import { pbkdf2, pbkdf2Sync, randomBytes } from 'crypto';

export interface UserInterface {
  _id: ObjectId;
  lastName: string;
  firstName: string;
  email: string;
  phone: string;
  hash: string;
  salt: string;
  recoveryToken: string;
  deviceId: string;
  registrationToken: string;
}

interface UserMethods {
  generateRecoveryToken: () => void;
  generateHashAndSalt: (password: string) => void;
  validPassword: (password: string) => boolean;
}

const userSchema = new Schema<UserInterface, {}, UserMethods>({
  lastName: { type: String, required: true },
  firstName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phone: { type: String, unique: true, required: true },
  hash: { type: String, select: false, required: false },
  salt: { type: String, select: false, required: false },
  recoveryToken: { type: String, select: false, required: false },
  deviceId: String,
  registrationToken: {
    type: String,
    required: true,
    default: () => Math.floor(100000 + Math.random() * 900000).toString(),
  },
});

userSchema.methods.generateRecoveryToken = function () {
  this.recoveryToken = randomBytes(20).toString('hex');
};

userSchema.methods.generateHashAndSalt = function (password: string) {
  this.salt = randomBytes(16).toString('hex');
  this.hash = pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString(
    'hex',
  );
};

userSchema.methods.validPassword = function (password: string) {
  const hash = pbkdf2Sync(password, this.salt, 1000, 64, `sha512`).toString(
    `hex`,
  );
  return this.hash === hash;
};

const User = mongoose.model<
  UserInterface,
  Model<UserInterface, {}, UserMethods>
>('User', userSchema);

export default User;
