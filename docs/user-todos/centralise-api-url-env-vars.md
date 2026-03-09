# Centralise API URL Environment Variables

## What changed

- Removed all `"https://api.bookskye.co.uk"` fallbacks from `process.env.NEXT_PUBLIC_API_URL`
- Created `getApiBaseUrl()` in `@repo/book-skye-api-client` — throws if `NEXT_PUBLIC_API_URL` is not set
- All `packages/auth` and `packages/book-skye-api-client` files now use `getApiBaseUrl()`
- Host app (`apps/book-skye-host-app`) now uses `EXPO_PUBLIC_API_URL` instead of `Constants.expoConfig.extra.apiUrl`

## Action required

### Next.js apps (book-skye-guest-website, book-skye-admin-website, skye-glamping-website)

Ensure `NEXT_PUBLIC_API_URL` is set in `.env.local` and production environment:

```
NEXT_PUBLIC_API_URL=https://api.bookskye.co.uk
```

### Host app (book-skye-host-app)

Create a `.env` file in `apps/book-skye-host-app/` with:

```
EXPO_PUBLIC_API_URL=https://api.bookskye.co.uk
```

Also set this in your EAS build profiles / environment.
