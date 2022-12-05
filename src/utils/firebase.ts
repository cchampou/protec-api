import { MessagingDevicesResponse } from 'firebase-admin/messaging';
import logger from './logger';

export const logMessagingDevicesResponse = (
  response: MessagingDevicesResponse,
) => {
  logger.info('Successfully sent message');
  logger.debug('Success count: ' + response.successCount);
  logger.debug('Failure count: ' + response.failureCount);
  if (response.failureCount > 0) {
    response.results.forEach((result) => {
      if (result.error) {
        logger.error('Notification failed to send to: ' + result.error);
      }
    });
  }
};
