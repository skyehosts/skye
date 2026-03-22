# Basic Auth — Environment Variables

Temporary basic auth has been added to **skye-hosts-guest-website** and **skye-glamping-website** via Next.js middleware. It only activates when `NEXT_PUBLIC_SKYE_ENVIRONMENT=production`.

## Vercel setup

Add these env vars to **both** projects in Vercel (Production environment only):

| Variable          | Value                 |
| ----------------- | --------------------- |
| `BASIC_AUTH_USER` | _(choose a username)_ |
| `BASIC_AUTH_PASS` | _(choose a password)_ |

These are server-only vars (no `NEXT_PUBLIC_` prefix) so they won't leak to the client bundle.

## Removing later

When ready to go public, either:

1. Delete `BASIC_AUTH_USER` and `BASIC_AUTH_PASS` from Vercel (middleware will pass through), or
2. Delete the `middleware.ts` files from both apps entirely.
