# Expo Push Notifications Setup

## Environment Variables

Add the following to your API `.env` files:

```
EXPO_ACCESS_TOKEN=your-expo-access-token-here
```

### How to get the token:

1. Go to https://expo.dev → Account Settings → Access Tokens
2. Create a new token with push notification permissions
3. Add it to `.env.local`, `.env.e2e`, and production environment config

## Database Migration

Run the migration to create `device_token` and `notification_history` tables:

```bash
pnpm --filter skye-hosts-api migration:run
```

Migration file: `src/migrations/1772883100000-add-device-token-and-notification-history.ts`

## Host App - Rebuild Required

`expo-notifications` was added as a dependency and to `app.json` plugins. You need to rebuild the dev client:

```bash
pnpm --filter skye-hosts-app build:dev:ios
# or
pnpm --filter skye-hosts-app build:dev:android
```

## Device Token Deregistration on Logout

The host app currently registers device tokens automatically on login. You should also call `DELETE /notification/device-token` when the user logs out to stop receiving push notifications on that device. Add this to the logout flow in `auth-context.tsx`.
