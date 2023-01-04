import Firebase from './Firebase';
import { UserInterface } from '../entities/User';
import Email from './Email';
import { EventInterface } from '../entities/Event';
import Sms from './Sms';
import Phone from './Phone';
import { render } from 'ejs';
import { readFileSync } from 'fs';

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
      case 'phone':
        return Phone.call(user.phone);
      case 'sms':
        return Sms.sendSms(
          user.phone,
          '[Protection Civile 69] URGENT Déclenchement - Recensement du personnel disponible. Consultez l’application. Ceci n’est pas une convocation.',
        );
      //  default or email case
      default: {
        const templatePath = 'src/views/emails/alert.ejs';
        const template = readFileSync(templatePath, 'utf8');
        return Email.sendEmail(
          user.email,
          render(template, {
            filename: templatePath,
            event: {
              ...event,
              start: new Date(event.start).toLocaleString('fr-FR'),
              end: new Date(event.end).toLocaleString('fr-FR'),
              id: event._id.toString(),
              comment: event.comment,
              title: event.title,
              location: event.location,
            },
          }),
          `[Protection Civile] URGENT - Déclenchement - ${event.title}`,
        );
      }
    }
  }
}

export default Notifier;
