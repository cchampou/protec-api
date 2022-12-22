import mongoose from 'mongoose';

class Database {
  public static async connect() {
    if (!process.env.DB_URL) throw new Error('DB_URL is not defined');
    mongoose.set('strictQuery', true);
    return mongoose.connect(process.env.DB_URL, {});
  }
}

export default Database;
