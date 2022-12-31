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

  public async notify(
    user: UserInterface,
    event: EventInterface,
  ): Promise<void> {
    const existingNotification = event.notifications.find(
      (notification) => notification.user.toString() === user._id.toString(),
    );
    if (existingNotification && existingNotification.available !== 'pending') {
      throw new Error('Notification already sent');
    }
    switch (this.config.mode) {
      case 'push':
        return Firebase.sendNotification(
          user.deviceId,
          event._id.toString(),
          event.title,
        );
      case 'email':
        return Email.sendEmail(user.email, 'Déclenchement');
      case 'phone':
        return Phone.call(user.phone);
      case 'sms':
        return Sms.sendSms(
          user.phone,
          '[Protection Civile 69] URGENT Déclenchement - Recensement du personnel disponible. Consultez l’application. Ceci n’est pas une convocation.',
        );
      default:
        return Email.sendEmail(user.email, 'Déclenchement');
    }
  }
}

export default Notifier;
