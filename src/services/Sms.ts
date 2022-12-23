import logger from '../utils/logger';
import Twilio from './Twilio';

class Sms {
  public static async sendSms(to: string, body: string) {
    const message = await Twilio.client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
    logger.info(
      `SMS sent with sid: ${message.sid} to ${to} with body: ${body}, status: ${message.status}`,
    );
    return;
  }
}

export default Sms;
