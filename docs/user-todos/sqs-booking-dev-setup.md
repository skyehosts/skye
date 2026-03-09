# SQS Booking Dev Setup

## Environment Variables

For local dev, ensure the following are set in `apps/skye-hosts-api/.env-files/.local.env`:

- `AWS_SQS_ENVIRONMENT=dev` (should already be present)
- `AWS_ACCESS_KEY_ID` — AWS credentials with SQS access
- `AWS_SECRET_ACCESS_KEY` — AWS credentials with SQS access

## SQS Forwarder Lambda

The dev SQS forwarder Lambda should be configured to forward messages to your local ngrok URL:

```
https://<ngrok-id>.ngrok-free.app/booking/on-sqs-message-for-successful-booking-payment
```

Update the Lambda's `BOOKINGS_SQS_FORWARDER_ENDPOINT` environment variable with your ngrok URL.

## Testing the Flow

1. Start the API locally: `pnpm --filter skye-hosts-api dev`
2. POST to `/payment/process-booking-payment` with body `{ "listingId": 1 }`
3. This sends an SQS message to the bookings queue
4. The Lambda picks it up and forwards to the webhook endpoint
5. Check API logs for: `SQS booking message received:`
