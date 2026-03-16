import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { ConfigService } from '../../config/providers/config.service';
import { EmailTemplate } from '../enums/email-template.enum';

@Injectable()
export class ResendService {
  private readonly logger = new Logger(ResendService.name);
  private readonly resend: Resend;
  private readonly fromEmail: string;
  private readonly disabled: boolean;

  constructor(private readonly configService: ConfigService) {
    this.disabled = process.env.RESEND_DISABLED === 'true';

    if (this.disabled) {
      this.logger.debug('Resend disabled');
      this.resend = new Resend('');
      this.fromEmail = '';
      return;
    }

    const { resendApiKey, resendFromEmail } = this.configService.getAll();

    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY is not defined');
    }

    if (!resendFromEmail) {
      throw new Error('RESEND_FROM_EMAIL is not defined');
    }

    this.resend = new Resend(resendApiKey);
    this.fromEmail = resendFromEmail;
  }

  async sendTemplate(
    to: string,
    template: EmailTemplate,
    variables: Record<string, string>,
  ): Promise<void> {
    if (this.disabled) {
      this.logger.debug(
        `[BYPASS] Email skipped — to=${to}, template=${template}, variables=${JSON.stringify(variables)}`,
      );
      return;
    }

    const { error } = await this.resend.emails.send({
      from: this.fromEmail,
      to,
      template: {
        id: template,
        variables,
      },
    });

    if (error) {
      throw new Error(`Resend request failed: ${error.message}`);
    }

    this.logger.debug(`Email sent via Resend — to=${to}, template=${template}`);
  }
}
