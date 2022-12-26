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

  public static async sendNotification(
    token: string,
    eventId: string,
    eventName: string,
  ) {
    try {
      const response: MessagingDevicesResponse = await getMessaging(
        Firebase.app,
      ).sendToDevice(
        token,
        {
          notification: {
            title: 'Déclenchement PC (test)',
            body: eventName,
            priority: 'high',
          },
          data: {
            type: 'alert',
            eventId,
          },
        },
        {
          fcmOptions: {
            analyticsLabel: 'alert',
          },
        },
      );
      logMessagingDevicesResponse(response);
    } catch (error) {
      logger.error(error.code);
      logger.error(error.message);
    }
  }
}

export default Firebase;
