# Twilio Verify — Custom Email Sender Setup

Email OTP uses the same Twilio Verify service SID as SMS. The only extra step is enabling and configuring the email channel in Twilio.

## Steps

### 1. Enable the email channel on your Verify service

1. Log in to [Twilio Console](https://console.twilio.com)
2. Navigate to **Verify → Services**
3. Select your existing Verify service (the one whose SID is in `TWILIO_VERIFY_SERVICE_SID`)
4. Go to the **Email** tab
5. Toggle **Email** on

### 2. Connect a SendGrid integration

Twilio Verify sends emails via SendGrid. You need a SendGrid account with a verified sender identity.

1. In **Twilio Console → Verify → Services → [your service] → Email**, click **Set up email integration**
2. You'll be prompted to connect a SendGrid account. Either:
   - Use an existing SendGrid API key, or
   - Create a new SendGrid account via the Twilio Console flow
3. In SendGrid, ensure you have a **verified sender identity** (either a single sender address or a domain authentication)
   - Recommended: **Domain Authentication** for `skyehosts.co.uk` or your sending domain
   - Go to SendGrid → Settings → Sender Authentication → Authenticate a Domain

### 3. Configure the from address and email template

Back in the Twilio Verify email settings:

1. Set **From Name** — e.g. `Skye Hosts`
2. Set **From Email** — e.g. `noreply@skyehosts.co.uk` (must match your verified SendGrid sender)
3. Optionally customise the **Subject** and **email body template** — Twilio provides a default template with the OTP code substituted via `{{otp}}`

### 4. No code changes needed

The `TWILIO_VERIFY_SERVICE_SID` env var is already reused — no new env vars are required for email. The code passes `channel: 'email'` to the same service.

### 5. Local development

In local mode (`SKYE_ENVIRONMENT=local`) Twilio is bypassed entirely — use code `000000` to verify any email address during development.
