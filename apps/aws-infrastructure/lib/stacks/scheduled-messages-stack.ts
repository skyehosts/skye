import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";
import { PROJECT_NAME } from "../config/environments";
import {
  BaseStackProps,
  getRequiredEnv,
  removalPolicy,
  applyStandardTags,
} from "../config/helpers";
import { SqsHttpForwarder } from "../constructs/sqs-http-forwarder";

/**
 * ScheduledMessagesStack
 *
 * Provisions the messaging infrastructure for the scheduled messages domain:
 *
 *   ┌──────────────────────────────────┐
 *   │  scheduled-messages-<env>        │  ← main queue
 *   │                                  │
 *   │  After 3 failed attempts         │──► scheduled-messages-<env>-dlq
 *   └──────────────────────────────────┘
 *
 * The DB-polling scheduler picks up pending scheduled messages and publishes
 * them to this queue. The SQS → HTTP forwarder Lambda then delivers each
 * message to the API for rendering and delivery.
 */
export class ScheduledMessagesStack extends cdk.Stack {
  public readonly scheduledMessagesQueue: sqs.Queue;
  public readonly scheduledMessagesDeadLetterQueue: sqs.Queue;

  constructor(scope: Construct, id: string, props: BaseStackProps) {
    super(scope, id, props);

    const { config } = props;

    const baseName = `${PROJECT_NAME}-scheduled-messages-queue-${config.envName}`;

    this.scheduledMessagesDeadLetterQueue = new sqs.Queue(
      this,
      "ScheduledMessagesDlq",
      {
        queueName: `${baseName}-dlq`,
        retentionPeriod: cdk.Duration.days(14),
        encryption: sqs.QueueEncryption.SQS_MANAGED,
        removalPolicy: removalPolicy(config),
      },
    );

    this.scheduledMessagesQueue = new sqs.Queue(
      this,
      "ScheduledMessagesQueue",
      {
        queueName: baseName,
        visibilityTimeout: cdk.Duration.minutes(5),
        retentionPeriod: cdk.Duration.days(4),
        receiveMessageWaitTime: cdk.Duration.seconds(20),
        encryption: sqs.QueueEncryption.SQS_MANAGED,
        deadLetterQueue: {
          queue: this.scheduledMessagesDeadLetterQueue,
          maxReceiveCount: 3,
        },
        removalPolicy: removalPolicy(config),
      },
    );

    const sentryLayer = lambda.LayerVersion.fromLayerVersionArn(
      this,
      "SentryLayer",
      getRequiredEnv("SQS_FORWARDER_SENTRY_DSN_LAYER_ARN"),
    );

    new SqsHttpForwarder(this, "ScheduledMessagesHttpForwarder", {
      queue: this.scheduledMessagesQueue,
      httpEndpoint: getRequiredEnv("SCHEDULED_MESSAGES_SQS_FORWARDER_ENDPOINT"),
      httpSecret: getRequiredEnv("SQS_FORWARDER_HTTP_SECRET"),
      httpSecretHeaderName: getRequiredEnv("SQS_FORWARDER_HEADER_NAME"),
      functionName: `${PROJECT_NAME}-scheduled-messages-forwarder-${config.envName}`,
      layers: [sentryLayer],
      additionalEnvironment: {
        SENTRY_DSN: getRequiredEnv(
          "SCHEDULED_MESSAGES_SQS_FORWARDER_SENTRY_DSN",
        ),
        SENTRY_ENVIRONMENT: config.envName,
      },
    });

    new cdk.CfnOutput(this, "ScheduledMessagesQueueUrl", {
      value: this.scheduledMessagesQueue.queueUrl,
      description:
        "URL of the scheduled messages SQS queue (use this to send messages)",
      exportName: `${baseName}-queue-url`,
    });

    new cdk.CfnOutput(this, "ScheduledMessagesQueueArn", {
      value: this.scheduledMessagesQueue.queueArn,
      description:
        "ARN of the scheduled messages SQS queue (use this to grant IAM permissions)",
      exportName: `${baseName}-queue-arn`,
    });

    new cdk.CfnOutput(this, "ScheduledMessagesDlqUrl", {
      value: this.scheduledMessagesDeadLetterQueue.queueUrl,
      description:
        "URL of the scheduled messages dead-letter queue (monitor for processing failures)",
      exportName: `${baseName}-dlq-url`,
    });

    new cdk.CfnOutput(this, "ScheduledMessagesDlqArn", {
      value: this.scheduledMessagesDeadLetterQueue.queueArn,
      description: "ARN of the scheduled messages dead-letter queue",
      exportName: `${baseName}-dlq-arn`,
    });

    applyStandardTags(this, config, "scheduled-messages");
  }
}
