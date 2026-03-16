# UnoSend Email Setup

## 1. Add API key to environment files

Add the following to `apps/skye-hosts-api/.env.local` and all other environment files (staging, production):

```
UNOSEND_API_KEY=<your_api_key>
```

Your API key can be found in the UnoSend dashboard under Settings → API Keys.

---

## 2. Create the following email templates in UnoSend

Log in at https://app.unosend.co and create one template per event type below.

> **Important:** The `template_id` values used in the code are the enum values in
> `apps/skye-hosts-api/src/modules/email/enums/email-template.enum.ts`.
> When you create each template in UnoSend and get the real template ID, update that
> enum value to match.

---

### Template 1 — Booking Requested

**Current enum value:** `booking_requested`
**Trigger:** Host receives this when a guest submits a new booking request.

**Variables available:**
| Variable | Example value |
|---|---|
| `recipientName` | `Jane Smith` |
| `title` | `New booking request` |
| `body` | `You have a new booking request for your listing` |
| `bookingId` | `123` |
| `url` | `https://app.skyehosts.co.uk/bookings/123` |

---

### Template 2 — Booking Confirmed

**Current enum value:** `booking_confirmed`
**Trigger:** Host receives this when a booking is confirmed via the SQS queue.

**Variables available:**
| Variable | Example value |
|---|---|
| `recipientName` | `Jane Smith` |
| `title` | `Booking confirmed` |
| `body` | `Your booking has been confirmed` |
| `bookingId` | `123` |
| `url` | `https://app.skyehosts.co.uk/bookings/123` |

---

### Template 3 — Booking Cancelled

**Current enum value:** `booking_cancelled`
**Trigger:** Sent when a booking is cancelled.

**Variables available:**
| Variable | Example value |
|---|---|
| `recipientName` | `Jane Smith` |
| `title` | `Booking cancelled` |
| `body` | `Your booking has been cancelled` |
| `bookingId` | `123` |
| `url` | `https://app.skyehosts.co.uk/bookings/123` |

---

### Template 4 — Message Received

**Current enum value:** `message_received`
**Trigger:** Sent when a user receives a new message (direct message or scheduled message).

**Variables available:**
| Variable | Example value |
|---|---|
| `recipientName` | `Jane Smith` |
| `title` | `New message` |
| `body` | `Hi, I had a question about check-in…` |
| `bookingId` | `123` |
| `conversationUrl` | `https://app.skyehosts.co.uk/messages/123` |

---

## 3. Update the EmailTemplate enum with real template IDs

Once you have created the templates in UnoSend and have the real template IDs (e.g. `tmpl_abc123`), update:

```
apps/skye-hosts-api/src/modules/email/enums/email-template.enum.ts
```

Replace each enum value with the real template ID from UnoSend:

```ts
export enum EmailTemplate {
  BookingRequested = "tmpl_<real_id>",
  BookingConfirmed = "tmpl_<real_id>",
  BookingCancelled = "tmpl_<real_id>",
  MessageReceived = "tmpl_<real_id>",
}
```

---

## 4. Note on local development

Emails are **not sent** when `SKYE_ENVIRONMENT=local`. The service logs a `[BYPASS]` debug
message instead. No UnoSend API key is needed locally.
