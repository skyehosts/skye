# EAS Build Setup

## Prerequisites

1. **Login to EAS** (if not already):

   ```bash
   npx eas-cli login
   ```

2. **Set `EXPO_TOKEN` in GitHub Secrets** for CI builds:
   - Go to https://expo.dev/accounts/skyehosts/settings/access-tokens
   - Create a new token (Robot type recommended for CI)
   - Add it as `EXPO_TOKEN` in your repo's GitHub Secrets

## Build Commands

### Development (dev client, internal distribution)

```bash
cd apps/skye-hosts-app
eas build --platform android --profile development
eas build --platform ios --profile development
```

### Preview (internal distribution, QA channel)

```bash
cd apps/skye-hosts-app
eas build --platform android --profile preview
eas build --platform ios --profile preview
```

### Production (store distribution, auto-increment build number)

```bash
cd apps/skye-hosts-app
eas build --platform android --profile production
eas build --platform ios --profile production
```

## CI Builds

Trigger builds via GitHub Actions:

1. Go to Actions > "EAS Build" workflow
2. Click "Run workflow"
3. Select platform (android/ios/all) and profile (development/preview/production)

## Environment Variables

Build profiles inject `SKYE_ENVIRONMENT` automatically:

- **development** → `SKYE_ENVIRONMENT=development`
- **preview** → `SKYE_ENVIRONMENT=qa`
- **production** → `SKYE_ENVIRONMENT=production`

For `SENTRY_DSN` and `API_URL`, set them as EAS secrets:

```bash
cd apps/skye-hosts-app
eas secret:create --name SENTRY_DSN --value <your-dsn>
eas secret:create --name API_URL --value <your-api-url>
```
