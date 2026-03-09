# Add JWT_SECRET environment variable

Add `JWT_SECRET` to the following locations:

- `apps/skye-hosts-api/.env.local` (for local development)
- Production environment variables (AWS/Vercel)

Generate a secure random value:

```bash
openssl rand -base64 64
```

This secret is used by the API to sign and verify JWT bearer tokens for authenticated endpoints (e.g. change-password).
