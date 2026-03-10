# Sentry Setup

Sentry has been added to `skye-hosts-guest-website`, `skye-glamping-website`, and `skye-hosts-app`.
Shared config lives in `packages/sentry` (`@repo/sentry`).

## Required: Create Sentry Projects

Create three projects in Sentry:

1. `skye-hosts-guest-website` — Platform: Next.js
2. `skye-glamping-website` — Platform: Next.js
3. `skye-hosts-app` — Platform: React Native

## Required: Environment Variables

### Shared: environment name

All three apps read a `SKYE_ENVIRONMENT` variable (e.g. `production`, `staging`, `development`) and
send it to Sentry so errors can be filtered by environment. Each platform requires a prefix for the
variable to be accessible inside the app bundle:

| App                      | Variable name                  |
| ------------------------ | ------------------------------ |
| skye-hosts-guest-website | `NEXT_PUBLIC_SKYE_ENVIRONMENT` |
| skye-glamping-website    | `NEXT_PUBLIC_SKYE_ENVIRONMENT` |
| skye-hosts-app           | `EXPO_PUBLIC_SKYE_ENVIRONMENT` |

### apps/skye-hosts-guest-website (`.env.local` for dev, hosting provider for prod)

```
NEXT_PUBLIC_GUEST_WEBSITE_SENTRY_DSN=https://xxx@oXXX.ingest.sentry.io/XXX
NEXT_PUBLIC_SKYE_ENVIRONMENT=production
```

### apps/skye-glamping-website (`.env.local` for dev, hosting provider for prod)

```
NEXT_PUBLIC_GLAMPING_WEBSITE_SENTRY_DSN=https://xxx@oXXX.ingest.sentry.io/XXX
NEXT_PUBLIC_SKYE_ENVIRONMENT=production
```

### apps/skye-hosts-app (`.env` for dev, EAS Secrets for prod)

```
EXPO_PUBLIC_SENTRY_DSN=https://xxx@oXXX.ingest.sentry.io/XXX
EXPO_PUBLIC_SKYE_ENVIRONMENT=production
```

For production EAS builds:

```
eas secret:create --name EXPO_PUBLIC_SENTRY_DSN --value <dsn>
eas secret:create --name EXPO_PUBLIC_SKYE_ENVIRONMENT --value production
```

## Optional: Source Maps (Production)

Source maps make stack traces readable in Sentry (otherwise you'll see minified code).

### Web apps — add to CI/CD environment

```
SENTRY_AUTH_TOKEN=your-auth-token
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-project-slug
```

### React Native — run after each EAS build

```
npx @sentry/react-native-cli upload-dsym   # iOS dSYMs
npx sentry-cli upload-proguard             # Android ProGuard
```

Or integrate via `eas.json` `postBuild` hook.

Generate an auth token at: Sentry → Settings → Auth Tokens → Create New Token (with `project:releases` and `org:read` scopes).
