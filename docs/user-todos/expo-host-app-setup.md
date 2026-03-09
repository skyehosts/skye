# Skye Hosts Host App - Setup Steps

## 1. Install EAS CLI (if not already installed)

```bash
npm install -g eas-cli
```

## 2. Log in to Expo

```bash
eas login
```

## 3. Link to an Expo project

From `apps/skye-hosts-app/`, run:

```bash
eas init
```

This will create/link the project on your Expo account and add a `projectId` to `app.json`.

## 4. Configure EAS Build (first time)

```bash
eas build:configure
```

This will validate your `eas.json` and set up any missing fields.

## 5. Create a development build

For testing on a physical device:

```bash
# iOS (requires Apple Developer account)
eas build --profile development --platform ios

# Android
eas build --profile development --platform android
```

Or use Expo Go for quick prototyping:

```bash
pnpm --filter skye-hosts-app start
```

## 6. Apple Developer & Google Play setup (for production)

- **iOS**: Ensure you have an Apple Developer account ($99/year). EAS will handle provisioning profiles and certificates.
- **Android**: Create a Google Play Developer account ($25 one-time). You'll need a keystore — EAS can generate one for you during `eas build`.

## 7. Bundle identifiers

Already configured in `app.json`:

- iOS: `com.skyehosts.host`
- Android: `com.skyehosts.host`

Change these if you want different identifiers.

## 8. Run database migration

After deploying the API (or locally), run the migration to add `phoneNumber` column and make `email`/`passwordHash`/`stripeCustomerId` nullable:

```bash
pnpm --filter skye-hosts-api migration:up
```

## 9. Running locally

```bash
# Start Expo dev server
pnpm --filter skye-hosts-app start

# Or via turbo
pnpm dev --filter skye-hosts-app
```
