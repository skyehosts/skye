import { Injectable, Logger } from '@nestjs/common';
import { Twilio } from 'twilio';

const TEST_OTP_CODE = '000000';

@Injectable()
export class TwilioService {
  private readonly logger = new Logger(TwilioService.name);
  private readonly client: Twilio | null;
  private readonly verifyServiceSid: string;
  private readonly isBypassMode: boolean;

  constructor() {
    this.isBypassMode = process.env.SKYE_ENVIRONMENT === 'local';

    if (this.isBypassMode) {
      this.client = null;
      this.verifyServiceSid = '';
      this.logger.debug('Twilio bypass mode enabled (local environment)');
    } else {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      this.verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
      this.client = new Twilio(accountSid, authToken);
    }
  }

  async sendVerification(phoneNumber: string): Promise<void> {
    const formattedNumber = this.formatUkNumber(phoneNumber);

    if (this.isBypassMode) {
      this.logger.debug(
        `[BYPASS] Verification skipped for ${formattedNumber} — use code ${TEST_OTP_CODE}`,
      );
      return;
    }

    await this.client.verify.v2
      .services(this.verifyServiceSid)
      .verifications.create({
        to: formattedNumber,
        channel: 'sms',
      });

    this.logger.debug(`Verification sent to ${formattedNumber}`);
  }

  async checkVerification(phoneNumber: string, code: string): Promise<boolean> {
    const formattedNumber = this.formatUkNumber(phoneNumber);

    if (this.isBypassMode) {
      this.logger.debug(
        `[BYPASS] Verification check for ${formattedNumber} — code=${code}`,
      );
      return code === TEST_OTP_CODE;
    }

    try {
      const check = await this.client.verify.v2
        .services(this.verifyServiceSid)
        .verificationChecks.create({
          to: formattedNumber,
          code,
        });

      return check.status === 'approved';
    } catch (err: any) {
      // 404 means the verification session expired or was already used
      if (err?.status === 404) return false;
      throw err;
    }
  }

  async sendVerificationToEmail(email: string): Promise<void> {
    if (this.isBypassMode) {
      this.logger.debug(
        `[BYPASS] Email verification skipped for ${email} — use code ${TEST_OTP_CODE}`,
      );
      return;
    }

    await this.client.verify.v2
      .services(this.verifyServiceSid)
      .verifications.create({
        to: email,
        channel: 'email',
      });

    this.logger.debug(`Email verification sent to ${email}`);
  }

  async checkVerificationForEmail(
    email: string,
    code: string,
  ): Promise<boolean> {
    if (this.isBypassMode) {
      this.logger.debug(
        `[BYPASS] Email verification check for ${email} — code=${code}`,
      );
      return code === TEST_OTP_CODE;
    }

    try {
      const check = await this.client.verify.v2
        .services(this.verifyServiceSid)
        .verificationChecks.create({
          to: email,
          code,
        });

      return check.status === 'approved';
    } catch (err: any) {
      if (err?.status === 404) return false;
      throw err;
    }
  }

  private formatUkNumber(phoneNumber: string): string {
    const digits = phoneNumber.replace(/\s+/g, '');
    if (digits.startsWith('+44')) {
      return digits;
    }
    if (digits.startsWith('0')) {
      return `+44${digits.slice(1)}`;
    }
    return `+44${digits}`;
  }
}
