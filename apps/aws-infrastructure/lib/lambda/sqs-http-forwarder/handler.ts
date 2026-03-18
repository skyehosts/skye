import type { SQSEvent, SQSHandler } from "aws-lambda";
import type { ISqsBookingMessageDto } from "@repo/skye-hosts-api-client";

// @sentry/aws-serverless is provided via the Lambda layer and marked as
// external in the esbuild config, so it resolves from /opt/nodejs at runtime.

const Sentry = process.env["SENTRY_DSN"]
  ? (() => {
      const s = require("@sentry/aws-serverless");
      s.init({
        dsn: process.env["SENTRY_DSN"],
        environment: process.env["SENTRY_ENVIRONMENT"],
        tracesSampleRate: 1.0,
      });
      return s;
    })()
  : null;

const HTTP_ENDPOINT = process.env["HTTP_ENDPOINT"]!;
const HTTP_SECRET = process.env["HTTP_SECRET"]!;
const HTTP_SECRET_HEADER_NAME = process.env["HTTP_SECRET_HEADER_NAME"]!;

const rawHandler: SQSHandler = async (event: SQSEvent): Promise<void> => {
  for (const record of event.Records) {
    const messageId = record.messageId;

    console.log(`Processing message ${messageId}`);

    let body: ISqsBookingMessageDto;
    try {
      body = JSON.parse(record.body) as ISqsBookingMessageDto;
    } catch (err) {
      console.error(`Failed to parse message ${messageId}:`, err);
      throw new Error(`Failed to parse message ${messageId}`);
    }

    const response = await fetch(HTTP_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        [HTTP_SECRET_HEADER_NAME]: HTTP_SECRET,
      },
      body: JSON.stringify(body),
    });

    console.log(`Message ${messageId} forwarded — status ${response.status}`);

    if (!response.ok) {
      const responseBody = await response.text();
      console.error(
        `Non-2xx response for message ${messageId}: ${response.status} — ${responseBody}`,
      );
      throw new Error(`HTTP ${response.status} for message ${messageId}`);
    }
  }
};

export const handler = Sentry ? Sentry.wrapHandler(rawHandler) : rawHandler;
