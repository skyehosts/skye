# Scheduled Messages — Required Environment Variables

The new `ScheduledMessagesStack` requires the following environment variables to be set before CDK deployment:

## New Variables

- **`SCHEDULED_MESSAGES_SQS_FORWARDER_ENDPOINT`** — The HTTP endpoint that the SQS forwarder Lambda will POST scheduled message payloads to (e.g. `https://api.example.com/scheduled-message/on-sqs-message`).

## Reused Variables

These should already be configured from the bookings stack setup:

- **`SQS_FORWARDER_HTTP_SECRET`** — Shared secret used by the Lambda forwarder to authenticate requests to the API.
- **`SQS_FORWARDER_HEADER_NAME`** — HTTP header name that carries the secret value.
