# Twilio Verify Setup

## 1. Create a Twilio Verify Service

1. Sign up / log in at https://www.twilio.com/console
2. Go to **Verify** > **Services** > **Create new**
3. Name it (e.g. "Skye Glamping")
4. Note the **Service SID** (starts with `VA...`)

## 2. Add env vars

Add to `apps/skye-hosts-api/.env.local`:

```
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_VERIFY_SERVICE_SID=VA...
```

Add the same to `.env.e2e` (can use test credentials for e2e).

For deployed environments (Heroku), set these as config vars.

## 3. Phone number format

The implementation auto-formats UK numbers:

- `07123456789` → `+447123456789`
- `+447123456789` → `+447123456789` (unchanged)
- `7123456789` → `+447123456789`
