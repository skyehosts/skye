# EAS Secrets Setup

`API_URL` has been added to `eas.json` env blocks directly (not sensitive).

`SENTRY_DSN` is sensitive and should be set as an EAS secret:

```bash
eas secret:create --name SENTRY_DSN --value <your-sentry-dsn> --scope project
```

After setting this, trigger a new EAS build to pick it up.
