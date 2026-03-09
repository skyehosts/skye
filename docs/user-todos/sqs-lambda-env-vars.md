# SQS → Lambda HTTP Forwarder — Environment Variables

The following environment variables are required for the SQS-to-HTTP forwarder Lambda in the BookingsStack.

## Variables

| Variable                          | Description                                                            | Example                                      |
| --------------------------------- | ---------------------------------------------------------------------- | -------------------------------------------- |
| `BOOKINGS_SQS_FORWARDER_ENDPOINT` | Full URL of the skye-hosts-api endpoint that receives booking messages | `https://api.skyehosts.com/bookings/webhook` |
| `SQS_FORWARDER_HTTP_SECRET`       | Shared secret for authenticating webhook requests                      | _(generate a strong random string)_          |
| `SQS_FORWARDER_HEADER_NAME`       | HTTP header name used to send the secret                               | `x-webhook-secret`                           |

## How they're used

These values are passed as CDK context or process environment variables at deploy time and configured as Lambda environment variables on the forwarder function. The Lambda includes the secret in the specified header on every HTTP POST to the API endpoint.

## Where to set them

- **Local development**: Export in your shell or add to a `.env` file before running `cdk deploy`
- **CI/CD**: Add as pipeline secrets/variables
