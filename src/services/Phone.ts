import logger from '../utils/logger';
import Twilio from './Twilio';

if (!process.env.API_BASE_URL) throw new Error('API_BASE_URL is not defined');

class Sms {
  public static async call(to: string) {
    if (!process.env.TWILIO_PHONE_NUMBER) {
      throw new Error('TWILIO_PHONE_NUMBER is not defined');
    }
    try {
      const url = `${process.env.API_BASE_URL}/static/voice.xml`;
      logger.debug(`XML url: ${url}`);
      const call = await Twilio.client.calls.create({
        url,
        to,
        from: process.env.TWILIO_PHONE_NUMBER,
      });
      logger.info(
        `Call sent with sid: ${call.sid} to ${to}, status: ${call.status}`,
      );
    } catch (error) {
      logger.error(error);
    }
  }
}

export default Sms;
