# NextAuth.js Environment Variables

## Required for each Vercel project

Add `NEXTAUTH_SECRET` to each of these Vercel projects:

- skye-hosts-guest-website
- skye-hosts-app
- skye-glamping-website
- skye-hosts-admin-website

### Generate the secret

```bash
openssl rand -base64 32
```

You can use the same secret across all apps (no cross-subdomain cookie sharing).

### Local development

Add to `.env.local` in each app:

```
NEXTAUTH_SECRET=<your-generated-secret>
```

## Admin website Vercel project

The `skye-hosts-admin-website` app has been scaffolded. You need to:

1. Create a new Vercel project for it
2. Set the `VERCEL_PROJECT_ID_SKYE_GLAMPING_ADMIN` GitHub variable
3. Add `NEXTAUTH_SECRET` to the project's environment variables
