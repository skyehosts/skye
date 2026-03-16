# Resend Email Setup

Migrated from UnoSend to Resend (resend.com).

## 1. Create a Resend account and get an API key

Sign up at https://resend.com and go to **API Keys** to generate a key.

## 2. Verify your sending domain

In the Resend dashboard go to **Domains** and add/verify the domain you'll send from
(e.g. `skyehosts.co.uk`). DNS records will be provided to add to your registrar.

## 3. Add environment variables

Add these to `apps/skye-hosts-api/.env.local` and all environment files (staging, production):

```
RESEND_API_KEY=re_<your_api_key>
RESEND_FROM_EMAIL=noreply@skyehosts.co.uk
```

`RESEND_DISABLED=true` is set by default in `.env.local.example` — emails are skipped in local
development. Remove or set to `false` in staging/production.

## 4. Create email templates in Resend dashboard

Go to **Templates** in the Resend dashboard and create one template per event type below.
Each template can use variables with `{{variableName}}` syntax.

The `EmailTemplate` enum values in
`apps/skye-hosts-api/src/modules/email/enums/email-template.enum.ts`
must match the template IDs from Resend. Once you create each template, copy its ID and update
the enum:

```ts
export enum EmailTemplate {
  BookingRequested = "<resend_template_id>",
  BookingConfirmed = "<resend_template_id>",
  BookingCancelled = "<resend_template_id>",
  MessageReceived = "<resend_template_id>",
}
```

The service passes `template.id` and `template.variables` directly to Resend's SDK, so any
variables used in your dashboard templates will be substituted automatically.

---

## 5. Remove old UnoSend config from non-local env files

If staging or production `.env` files still contain `UNOSEND_API_KEY` or `UNOSEND_DISABLED`,
remove those lines.

## 6. Email templates reference

These are the 4 email templates sent by the notification system. Make sure content covers
all the variables they receive:

| Template           | Trigger                         | Variables                                                        |
| ------------------ | ------------------------------- | ---------------------------------------------------------------- |
| `BookingRequested` | Host gets a new booking request | `recipientName`, `title`, `body`, `bookingId`, `url`             |
| `BookingConfirmed` | Booking is confirmed            | `recipientName`, `title`, `body`, `bookingId`, `url`             |
| `BookingCancelled` | Booking is cancelled            | `recipientName`, `title`, `body`, `bookingId`, `url`             |
| `MessageReceived`  | User receives a new message     | `recipientName`, `title`, `body`, `bookingId`, `conversationUrl` |
