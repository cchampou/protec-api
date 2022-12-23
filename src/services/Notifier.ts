import Firebase from './Firebase';
import { UserInterface } from '../entities/User';
import Email from './Email';
import { EventInterface } from '../entities/Event';
import Sms from './Sms';
import Phone from './Phone';

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

  public notify(user: UserInterface, event: EventInterface) {
    switch (this.config.mode) {
      case 'push':
        return Firebase.sendNotification(user.deviceId, event._id.toString());
      case 'email':
        return Email.sendEmail(user.email, 'Déclenchement');
      case 'phone':
        return Phone.call(user.phone);
      case 'sms':
        return Sms.sendSms(user.phone, 'Déclenchement');
      default:
        return Email.sendEmail(user.email, 'Déclenchement');
    }
  }
}

export default Notifier;
