import logger from '../utils/logger';
import Twilio from './Twilio';

class Sms {
  public static async call(to: string) {
    if (!process.env.TWILIO_PHONE_NUMBER) {
      throw new Error('TWILIO_PHONE_NUMBER is not defined');
    }
    const call = await Twilio.client.calls.create({
      url: 'http://demo.twilio.com/docs/voice.xml',
      to,
      from: process.env.TWILIO_PHONE_NUMBER,
    });
    logger.info(
      `Call sent with sid: ${call.sid} to ${to}, status: ${call.status}`,
    );
    return;
  }
}

export default Sms;
