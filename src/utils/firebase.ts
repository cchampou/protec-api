import { MessagingDevicesResponse } from 'firebase-admin/messaging';
import logger from './logger';

export const logMessagingDevicesResponse = (
  response: MessagingDevicesResponse,
) => {
  if (response.failureCount > 0) {
    response.results.forEach((result) => {
      if (result.error) {
        throw new Error('Notification failed to send to: ' + result.error);
      }
    });
  }
  if (response.successCount > 0) {
    logger.info('Notification sent');
  }
};
