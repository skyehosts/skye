import {
  GetQueueUrlCommand,
  SQSClient,
  SendMessageCommand,
} from '@aws-sdk/client-sqs';
import { Injectable, Logger } from '@nestjs/common';
import {
  ConfigService,
  IEnvironmentVariables,
} from '../../config/providers/config.service';
import { AwsQueueNames } from '../types';

@Injectable()
export class AwsQueueSendMessageService {
  environmentVariables: IEnvironmentVariables;
  protected logger = new Logger(AwsQueueSendMessageService.name);

  private sqsClient: SQSClient;
  private queueUrlCache = new Map<string, string>();

  constructor(private configService: ConfigService) {
    this.environmentVariables = this.configService.getAll();
    this.sqsClient = new SQSClient({ region: 'eu-west-1' });
  }

  private getQueueName(queue: AwsQueueNames): string {
    return `skye-hosts-${queue}-queue-${this.environmentVariables.awsSqsEnvironment}`;
  }

  private async getQueueUrl(queueName: string): Promise<string> {
    const cached = this.queueUrlCache.get(queueName);
    if (cached) return cached;

    const result = await this.sqsClient.send(
      new GetQueueUrlCommand({ QueueName: queueName }),
    );
    const url = result.QueueUrl!;
    this.queueUrlCache.set(queueName, url);
    return url;
  }

  async sendMessage<T>(queueOrTopic: AwsQueueNames, messageBody: T) {
    const queueName = this.getQueueName(queueOrTopic);
    try {
      this.logger.debug(`Attempting to send message to queue ${queueName}`);
      const queueUrl = await this.getQueueUrl(queueName);

      const result = await this.sqsClient.send(
        new SendMessageCommand({
          QueueUrl: queueUrl,
          MessageBody: JSON.stringify(messageBody),
        }),
      );

      this.logger.debug(`Message sent to ${queueName}: ${result.MessageId}`);
    } catch (error) {
      this.logger.error(`Failed to send message to ${queueName}`, error);
      throw error;
    }
  }
}
