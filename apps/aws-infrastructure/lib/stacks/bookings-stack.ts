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
 * BookingsStack
 *
 * Provisions the messaging infrastructure for the bookings domain:
 *
 *   ┌──────────────────────────┐
 *   │  bookings-<env>          │  ← main queue
 *   │                          │
 *   │  After 3 failed attempts │──► bookings-<env>-dlq
 *   └──────────────────────────┘
 *
 * Design decisions:
 * - Standard queue (not FIFO): ordering is not required for bookings and
 *   standard queues offer higher throughput.
 * - DLQ: protects against poison-pill messages that would otherwise block
 *   the queue indefinitely.
 * - SSE-SQS encryption: at-rest encryption with no additional KMS cost,
 *   adequate for non-PII booking event payloads.
 * - Long polling (20s): reduces the number of empty ReceiveMessage API calls
 *   and therefore lowers cost.
 * - RETAIN removal policy in prod: prevents accidental data loss if the stack
 *   is ever torn down; manual cleanup is required before re-creating.
 */
export class BookingsStack extends cdk.Stack {
  /**
   * The main bookings queue.
   *
   * Exposed as a public readonly so that future stacks (e.g. a Lambda stack)
   * can reference it without tight coupling via CloudFormation exports.
   */
  public readonly bookingsQueue: sqs.Queue;

  /**
   * Dead-letter queue for messages that could not be processed successfully.
   *
   * Consumers should monitor this queue (e.g. alarm on ApproximateNumberOfMessagesVisible)
   * to detect processing failures early.
   */
  public readonly bookingsDeadLetterQueue: sqs.Queue;

  constructor(scope: Construct, id: string, props: BaseStackProps) {
    super(scope, id, props);

    const { config } = props;

    // Base name used as a prefix for all resources in this stack.
    // Changing this single constant renames every queue, export, and tag.
    const baseName = `${PROJECT_NAME}-bookings-queue-${config.envName}`;

    // -------------------------------------------------------------------------
    // Dead-Letter Queue (DLQ)
    //
    // The DLQ is declared before the main queue because the main queue
    // references it in its `deadLetterQueue` prop.
    //
    // A message is routed here automatically by SQS after it has been received
    // (but not deleted) `maxReceiveCount` times — indicating that consumers are
    // repeatedly failing to process it.
    // -------------------------------------------------------------------------
    this.bookingsDeadLetterQueue = new sqs.Queue(this, "BookingsDlq", {
      queueName: `${baseName}-dlq`,

      // Retain messages for the maximum allowed period (14 days) so engineers
      // have ample time to investigate and replay failed messages before they
      // are purged.
      retentionPeriod: cdk.Duration.days(14),

      // SSE-SQS: server-side encryption managed by SQS at no extra cost.
      // Upgrade to QueueEncryption.KMS if you need cross-account access or
      // custom key rotation policies.
      encryption: sqs.QueueEncryption.SQS_MANAGED,

      // In production, retain the physical queue even if the CloudFormation
      // stack is deleted — unprocessed DLQ messages would otherwise be lost.
      // In non-production, allow clean removal to keep accounts tidy.
      removalPolicy: removalPolicy(config),
    });

    // -------------------------------------------------------------------------
    // Main Bookings Queue
    //
    // Receives booking events (new booking, cancellation, modification, …)
    // produced by the API or external systems.
    //
    // Key consumer contract:
    //   - Messages are delivered AT LEAST ONCE; consumers must be idempotent.
    //   - Consumers must delete the message within `visibilityTimeout` or it
    //     will become visible again (and count toward maxReceiveCount).
    // -------------------------------------------------------------------------
    this.bookingsQueue = new sqs.Queue(this, "BookingsQueue", {
      queueName: baseName,

      // Visibility timeout — how long SQS hides a message from other consumers
      // while one consumer is processing it.
      //
      // Rule of thumb: set this to at least 6× the Lambda timeout (if using
      // Lambda), or to the maximum expected single-message processing duration.
      // 5 minutes is a safe starting point for booking workflows.
      visibilityTimeout: cdk.Duration.minutes(5),

      // Message retention — how long an unprocessed message stays in the queue
      // before SQS discards it. 4 days gives the team time to recover from
      // consumer outages without paying for long-term storage.
      retentionPeriod: cdk.Duration.days(4),

      // Long polling — the ReceiveMessage call waits up to 20 seconds for a
      // message before returning an empty response. Reduces API call volume and
      // associated cost vs. short polling (0 seconds).
      receiveMessageWaitTime: cdk.Duration.seconds(20),

      // SSE-SQS encryption — matches the DLQ setting.
      encryption: sqs.QueueEncryption.SQS_MANAGED,

      // Dead-letter queue configuration.
      // maxReceiveCount: 3 means a message is moved to the DLQ on its 4th
      // receive (i.e. after 3 failed processing attempts). Tune this based on
      // whether transient failures are expected in your consumer logic.
      deadLetterQueue: {
        queue: this.bookingsDeadLetterQueue,
        maxReceiveCount: 3,
      },

      // Same RETAIN / DESTROY policy as the DLQ.
      removalPolicy: removalPolicy(config),
    });

    // -------------------------------------------------------------------------
    // SQS → HTTP Forwarder Lambda
    //
    // Consumes messages from the bookings queue and forwards them via HTTP
    // POST to the skye-hosts-api. On non-2xx responses the Lambda throws,
    // causing SQS to retry (up to maxReceiveCount) before routing to the DLQ.
    // -------------------------------------------------------------------------
    const sentryLayer = lambda.LayerVersion.fromLayerVersionArn(
      this,
      "SentryLayer",
      getRequiredEnv("SQS_FORWARDER_SENTRY_DSN_LAYER_ARN"),
    );

    new SqsHttpForwarder(this, "BookingsHttpForwarder", {
      queue: this.bookingsQueue,
      httpEndpoint: getRequiredEnv("BOOKINGS_SQS_FORWARDER_ENDPOINT"),
      httpSecret: getRequiredEnv("SQS_FORWARDER_HTTP_SECRET"),
      httpSecretHeaderName: getRequiredEnv("SQS_FORWARDER_HEADER_NAME"),
      functionName: `${PROJECT_NAME}-bookings-forwarder-${config.envName}`,
      layers: [sentryLayer],
      additionalEnvironment: {
        SENTRY_DSN: getRequiredEnv("BOOKINGS_SQS_FORWARDER_SENTRY_DSN"),
        SENTRY_ENVIRONMENT: config.envName,
      },
    });

    // -------------------------------------------------------------------------
    // CloudFormation Outputs
    //
    // Outputs are visible in the AWS console after deployment and can be
    // consumed by other stacks via Fn::ImportValue, or by CI/CD pipelines via
    // `aws cloudformation describe-stacks`.
    //
    // exportName must be unique per account+region, hence the env suffix.
    // -------------------------------------------------------------------------
    new cdk.CfnOutput(this, "BookingsQueueUrl", {
      value: this.bookingsQueue.queueUrl,
      description: "URL of the bookings SQS queue (use this to send messages)",
      exportName: `${baseName}-queue-url`,
    });

    new cdk.CfnOutput(this, "BookingsQueueArn", {
      value: this.bookingsQueue.queueArn,
      description:
        "ARN of the bookings SQS queue (use this to grant IAM permissions)",
      exportName: `${baseName}-queue-arn`,
    });

    new cdk.CfnOutput(this, "BookingsDlqUrl", {
      value: this.bookingsDeadLetterQueue.queueUrl,
      description:
        "URL of the bookings dead-letter queue (monitor for processing failures)",
      exportName: `${baseName}-dlq-url`,
    });

    new cdk.CfnOutput(this, "BookingsDlqArn", {
      value: this.bookingsDeadLetterQueue.queueArn,
      description: "ARN of the bookings dead-letter queue",
      exportName: `${baseName}-dlq-arn`,
    });

    applyStandardTags(this, config, "bookings");
  }
}
