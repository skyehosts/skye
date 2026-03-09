# Centralise API URL Environment Variables

## What changed

- Removed all `"https://api.skyehosts.co.uk"` fallbacks from `process.env.NEXT_PUBLIC_API_URL`
- Created `getApiBaseUrl()` in `@repo/skye-hosts-api-client` — throws if `NEXT_PUBLIC_API_URL` is not set
- All `packages/auth` and `packages/skye-hosts-api-client` files now use `getApiBaseUrl()`
- Host app (`apps/skye-hosts-app`) now uses `EXPO_PUBLIC_API_URL` instead of `Constants.expoConfig.extra.apiUrl`

## Action required

### Next.js apps (skye-hosts-guest-website, skye-hosts-admin-website, skye-glamping-website)

Ensure `NEXT_PUBLIC_API_URL` is set in `.env.local` and production environment:

```
NEXT_PUBLIC_API_URL=https://api.skyehosts.co.uk
```

### Host app (skye-hosts-app)

Create a `.env` file in `apps/skye-hosts-app/` with:

```
EXPO_PUBLIC_API_URL=https://api.skyehosts.co.uk
```

Also set this in your EAS build profiles / environment.
