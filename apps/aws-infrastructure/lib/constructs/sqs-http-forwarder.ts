import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { Construct } from "constructs";
import * as path from "path";

export interface SqsHttpForwarderProps {
  /** The SQS queue to consume messages from. */
  readonly queue: sqs.IQueue;

  /** The HTTP endpoint URL to forward messages to via POST. */
  readonly httpEndpoint: string;

  /** The shared secret value sent in the HTTP header for authentication. */
  readonly httpSecret: string;

  /** The HTTP header name used to send the secret (e.g. "x-webhook-secret"). */
  readonly httpSecretHeaderName: string;

  /** Optional function name override. Defaults to construct ID. */
  readonly functionName?: string;

  /** Optional Lambda layers to attach to the function. */
  readonly layers?: lambda.ILayerVersion[];

  /** Optional additional environment variables merged into the function environment. */
  readonly additionalEnvironment?: Record<string, string>;
}

/**
 * SqsHttpForwarder
 *
 * Reusable L3 construct that creates a Lambda function consuming messages
 * from an SQS queue and forwarding them via HTTP POST to a target endpoint.
 *
 * On non-2xx responses the handler throws, causing SQS to retry delivery
 * (up to the queue's maxReceiveCount) before routing to the DLQ.
 */
export class SqsHttpForwarder extends Construct {
  public readonly handler: lambdaNodejs.NodejsFunction;

  constructor(scope: Construct, id: string, props: SqsHttpForwarderProps) {
    super(scope, id);

    this.handler = new lambdaNodejs.NodejsFunction(this, "Handler", {
      functionName: props.functionName,
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: path.join(
        __dirname,
        "..",
        "lambda",
        "sqs-http-forwarder",
        "handler.ts",
      ),
      handler: "handler",
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      layers: props.layers,
      environment: {
        HTTP_ENDPOINT: props.httpEndpoint,
        HTTP_SECRET: props.httpSecret,
        HTTP_SECRET_HEADER_NAME: props.httpSecretHeaderName,
        ...props.additionalEnvironment,
      },
      bundling: {
        minify: true,
        sourceMap: true,
        target: "node22",
        // Sentry is provided via a Lambda layer — do not bundle it.
        externalModules: ["@sentry/aws-serverless"],
      },
    });

    this.handler.addEventSource(
      new SqsEventSource(props.queue, {
        batchSize: 1,
      }),
    );
  }
}
