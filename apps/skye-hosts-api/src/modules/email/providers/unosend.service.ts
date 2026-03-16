import { Injectable, Logger } from '@nestjs/common';
import { EmailTemplate } from '../enums/email-template.enum';

const UNOSEND_API_URL = 'https://app.unosend.co/api/v1/mail/send';

@Injectable()
export class UnoSendService {
  private readonly logger = new Logger(UnoSendService.name);
  private readonly apiKey: string;
  private readonly isBypassMode: boolean;

  constructor() {
    this.isBypassMode = process.env.UNOSEND_DISABLED === 'true';
    this.apiKey = process.env.UNOSEND_API_KEY ?? '';

    if (this.isBypassMode) {
      this.logger.debug('UnoSend disabled');
    }
  }

  async sendTemplate(
    to: string,
    template: EmailTemplate,
    variables: Record<string, string>,
  ): Promise<void> {
    if (this.isBypassMode) {
      this.logger.debug(
        `[BYPASS] Email skipped — to=${to}, template=${template}, variables=${JSON.stringify(variables)}`,
      );
      return;
    }

    const response = await fetch(UNOSEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to, template_id: template, variables }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `UnoSend request failed: ${response.status} ${response.statusText} — ${text}`,
      );
    }

    this.logger.debug(
      `Email sent via UnoSend — to=${to}, template=${template}`,
    );
  }
}
