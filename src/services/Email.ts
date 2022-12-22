import { createTransport, Transporter } from 'nodemailer';
import { UserInterface } from '../entities/User';
import logger from '../utils/logger';

class Email {
  static instance: Transporter;

  private static async init() {
    if (!Email.instance) {
      Email.instance = await createTransport({
        host: 'ssl0.ovh.net',
        port: 465,
        auth: {
          user: 'clement@champouillon.com',
          pass: process.env.SMTP_PASSWORD,
        },
      });
      logger.info('Email service initialized');
    }
  }

  public static async sendEmail(toEmail: string) {
    await this.init();
    await this.instance.sendMail({
      to: toEmail,
      text: 'Hello world',
      subject: 'Hello world',
      from: '"ADPC69" <no-reply@champouillon.com>',
    });
    logger.info('Email sent');
  }
}

export default Email;