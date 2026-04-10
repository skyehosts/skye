# EAS Rebuild Required — Custom Fonts

The app now uses `expo-font` and `expo-splash-screen` which include native modules. A new EAS dev client build is needed:

```bash
pnpm --filter skye-hosts-app build:dev:ios
pnpm --filter skye-hosts-app build:dev:android
```

After the build completes, restart with `expo start --dev-client` as usual.
