import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '../../config/providers/config.service';

export interface ExpoPushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: 'default' | null;
  channelId?: string;
}

export interface ExpoPushTicket {
  id?: string;
  status: 'ok' | 'error';
  message?: string;
  details?: { error?: string };
}

interface ExpoPushResponse {
  data: ExpoPushTicket[];
}

@Injectable()
export class ExpoPushClient {
  private readonly logger = new Logger(ExpoPushClient.name);
  private readonly accessToken: string | undefined;

  constructor(private readonly configService: ConfigService) {
    this.accessToken = this.configService.getAll().expoAccessToken;
  }

  async sendPushNotifications(
    messages: ExpoPushMessage[],
  ): Promise<ExpoPushTicket[]> {
    if (messages.length === 0) return [];

    const chunks = this.chunkMessages(messages);
    const allTickets: ExpoPushTicket[] = [];

    for (const chunk of chunks) {
      const tickets = await this.sendChunk(chunk);
      allTickets.push(...tickets);
    }

    return allTickets;
  }

  private async sendChunk(
    messages: ExpoPushMessage[],
  ): Promise<ExpoPushTicket[]> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers,
      body: JSON.stringify(messages),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Expo push API returned ${response.status}: ${text}`);
    }

    const result: ExpoPushResponse = await response.json();
    return result.data;
  }

  private chunkMessages(messages: ExpoPushMessage[]): ExpoPushMessage[][] {
    const chunkSize = 100;
    const chunks: ExpoPushMessage[][] = [];
    for (let i = 0; i < messages.length; i += chunkSize) {
      chunks.push(messages.slice(i, i + chunkSize));
    }
    return chunks;
  }
}
