import { DataSource } from 'typeorm';
import logger from '../utils/logger';
import User from '../entities/User';

class Database {
  private static _appDataSource: DataSource;

  public static get dataSource() {
    return new Promise<DataSource>((resolve, reject) => {
      if (!Database._appDataSource) {
        const tmpClient = new DataSource({
          url: 'mongodb+srv://admin:b8gt5k98c@main.cchssw7.mongodb.net/?retryWrites=true&w=majority',
          database: 'dev',
          type: 'mongodb',
          useUnifiedTopology: true,
          entities: [User],
          synchronize: true,
        });
        tmpClient
          .initialize()
          .then(() => {
            logger.info('Database initialized');
            Database._appDataSource = tmpClient;
            resolve(Database._appDataSource);
          })
          .catch((error) => {
            logger.error('Database connection failed', error);
            process.exit(1);
          });
      } else {
        logger.debug('Database already initialized');
        resolve(Database._appDataSource);
      }
    });
  }
}

export default Database;
