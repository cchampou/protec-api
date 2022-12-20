import mongoose from 'mongoose';

class Database {
  public static async connect() {
    mongoose.set('strictQuery', true);
    return mongoose.connect(
      'mongodb+srv://admin:b8gt5k98c@main.cchssw7.mongodb.net/dev?retryWrites=true&w=majority',
      {},
    );
  }
}

export default Database;
