# Action Required: Split Sentry DSN per SQS Forwarder

The shared `SQS_FORWARDER_SENTRY_DSN` variable has been replaced with two separate DSNs.

## For each GitHub environment (`qa`, `production`):

1. **Add** variable `BOOKINGS_SQS_FORWARDER_SENTRY_DSN` — DSN for the bookings Lambda forwarder
2. **Add** variable `SCHEDULED_MESSAGES_SQS_FORWARDER_SENTRY_DSN` — DSN for the scheduled messages Lambda forwarder
3. **Remove** the old variable `SQS_FORWARDER_SENTRY_DSN`

> Variables are set under: GitHub repo → Settings → Environments → (qa / production) → Variables
