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
  ): Promise<void> {
    const response: MessagingDevicesResponse = await getMessaging(
      Firebase.app,
    ).sendToDevice(
      token,
      {
        notification: {
          title: 'URGENT - Déclenchement en cours',
          body:
            eventName + '\n\nDis-nous si tu es dispo pour ce déclenchement.',
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
  }
}

export default Firebase;
