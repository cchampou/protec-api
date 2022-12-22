import { initializeApp, App } from 'firebase-admin/app';
import {
  getMessaging,
  MessagingDevicesResponse,
} from 'firebase-admin/messaging';
import { credential } from 'firebase-admin';
import logger from '../utils/logger';
import { logMessagingDevicesResponse } from '../utils/firebase';
import Database from './Database';

class Firebase {
  private static _appInstance: App;

  private static get app() {
    if (!Firebase._appInstance) {
      Firebase._appInstance = initializeApp(
        {
          credential: credential.cert('./firebase-key.json'),
        },
        'alert',
      );
      logger.info('Firebase initialized');
    } else {
      logger.debug('Firebase already initialized');
    }
    return Firebase._appInstance;
  }

  public static async sendNotification(token: string, eventId: string) {
    try {
      const response: MessagingDevicesResponse = await getMessaging(
        Firebase.app,
      ).sendToDevice(token, {
        notification: {
          title: 'Déclenchement PC',
          body: 'Ceci est un test système',
          priority: 'high',
        },
        data: {
          type: 'alert',
          eventId,
          title: 'Manifestation',
          comment:
            'Une manifestion est prévue samedi prochain, les autorités requièrent notre présence.',
          startDate: '10/12/2022',
          startTime: '10:00',
          endDate: '10/12/2022',
          endTime: '11:00',
          eProtecLink: 'https://franceprotectioncivile.org/index.php',
          location: 'Place Bellecour, Lyon',
        },
      });
      logMessagingDevicesResponse(response);
    } catch (error) {
      logger.error(error.code);
      logger.error(error.message);
    }
  }
}

export default Firebase;
