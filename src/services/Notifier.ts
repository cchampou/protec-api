import Firebase from './Firebase';
import { UserInterface } from '../entities/User';
import Email from './Email';

export type NotifierMode = 'email' | 'sms' | 'push' | 'phone';

type NotifierConfig = {
  mode: NotifierMode;
  eventId: string;
};

class Notifier {
  private config: NotifierConfig;

  constructor(config: NotifierConfig) {
    this.config = config;
  }

  public notify(user: UserInterface) {
    switch (this.config.mode) {
      case 'push':
        return Firebase.sendNotification(user.deviceId);
      case 'email':
        return Email.sendEmail(user.email);
      default:
        return Email.sendEmail(user.email);
    }
  }
}

export default Notifier;
