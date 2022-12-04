import { initializeApp, App } from 'firebase-admin/app';
import {
  getMessaging,
  MessagingDevicesResponse,
} from 'firebase-admin/messaging';
import { credential } from 'firebase-admin';
import logger from '../utils/logger';
import { logMessagingDevicesResponse } from '../utils/firebase';

class Firebase {
  private static _appInstance: App;
  private static TOKEN =
    'eWNzaNg_T2qa_rxAhzYb6A:APA91bEseUUXt78wBMonJg2AlTE4uvonR7gWgUrNbw_AmQmQBxCrSQ5KHlTxiNK35CDhunH6oJ_bcye5UIdBuROrudRjb5y0gE3UxTiqdbRWJd2p_1uydpSFCl4QFXa6P1THHUdvWJ-7';

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

  public static sendNotification() {
    getMessaging(Firebase.app)
      .sendToDevice(Firebase.TOKEN, {
        notification: {
          title: 'Déclenchement PC',
          body: 'Ceci est un test système',
          priority: 'high',
        },
        data: {
          type: 'alert',
          title: 'Manifestation',
          comment:
            'Une manifestion est prévue samedi prochain, les autorités requièrent notre présence.',
          startDate: '2019-10-10',
          startTime: '10:00',
          endDate: '2019-10-10',
          endTime: '11:00',
          eProtecLink: 'https://www.eprotec.fr',
          location: 'Place Bellecour, Lyon',
        },
      })
      .then((response: MessagingDevicesResponse) => {
        logMessagingDevicesResponse(response);
      })
      .catch((error) => {
        logger.error(error);
      });
  }
}

export default Firebase;
