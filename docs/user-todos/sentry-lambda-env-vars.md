# Sentry Lambda Layer — GitHub Repository Variables

Add the following variables to your GitHub repository secrets/variables (used during CDK deploy):

| Variable                         | Value                                                                       |
| -------------------------------- | --------------------------------------------------------------------------- |
| `SQS_FORWARDER_SENTRY_LAYER_ARN` | `arn:aws:lambda:eu-west-1:943013980633:layer:SentryNodeServerlessSDKv10:55` |
| `SQS_FORWARDER_SENTRY_DSN`       | Your Sentry DSN (find it in Sentry → Project Settings → Client Keys)        |

These are consumed by the `ScheduledMessagesStack` at CDK synth time via `getRequiredEnv(...)`.
