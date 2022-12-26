import { MessagingDevicesResponse } from 'firebase-admin/messaging';
import logger from './logger';

export const logMessagingDevicesResponse = (
  response: MessagingDevicesResponse,
) => {
  if (response.failureCount > 0) {
    logger.error('Failed to send notification');
    response.results.forEach((result) => {
      if (result.error) {
        logger.error('Notification failed to send to: ' + result.error);
      }
    });
  }
  if (response.successCount > 0) {
    logger.info('Notification sent');
  }
};
