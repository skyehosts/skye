# Skye

## Setup

### Infrastructure (manual)

- pnpm --filter=aws-infrastructure bootstrap:production
- (Browser: heroku.com) Resources -> Addon -> Heroku Postgres -> Essential 0
  - It will automatically attach & sort networking to dyno once deployed)
- (Local CLI): heroku domains:add api.skyehosts.co.uk --app skye-hosts-{env} #add custom domain to heroku dyno
- (Local CLI): heroku certs:auto:enable --app skye-hosts-{env} #add ssl certs to custom domain (even if hosted elsewhere)
- (Local CLI): heroku domains --app skye-hosts-{env} -> #Provides DNS target for Route 53
- (Browser: vercel.com)
  - Create projects, import to git, cancel deployed (handled by Github)
  - Create two domains (one www and one not)
    - Redirect using 308 www -> non www
  - In Route 53
    - A record -> Vercel IP
    - CNAME -> cname.vercel-dns.com
  - Project settings -> Git -> Disconnect (Creates unwanted github environments)

### Cloning:

- Use multiple .ssh profiles so can operate multiple git accounts simultaneously
- Then clone with named account like below:

```bash
git clone git@github-skye-hosts:skyehosts/monorepo.git
```

### Anthropic / Claude setup

- create a file at root called .envrc and put export ANTHROPIC_API_KEY="..." in it.
- Ensure envdir setup and you need to run env dir allow

### Install heroku CIL for convience

heroku info --app skye-hosts-{env} #Url
heroku logs --tail --app skye-hosts-{env} #Live logs
heroku logs --num 200 --app skye-hosts-{env} #Most recent lines
heroku config --app skye-hosts-{env} #Env vars
heroku run sh --app skye-hosts-{env} #Bash inside docker container

### Prerequisite #6: PGAdmin setup

Go to PGAdmin URL
Login with credentials from /apps/web-api/.local.env:

- Email: $PGADMIN_DEFAULT_ADMIN
- Password: $PGADMIN_DEFAULT_ADMIN

Then right click on servers & 'Create' -> 'Server'

- Host: host.docker.internal
- Port: $WEB_API_POSTGRES_PORT
- Username: $WEB_API_POSTGRES_USER
- Password: $WEB_API_POSTGRES_PASSWORD

### Add environment vars

- Manually add 'Config vars' in Heroku via browser
- Manually add EAS secrets to Expo (Either in browser or via CLI) E.G: eas secret:create --name SENTRY_DSN --value <your-sentry-dsn> --scope project
- Manually add environment vars to Vercel via browser (Some are org level and others project level)

## Installation

`nvm use 24` #Compatible with: Node 24.13.1
`pnpm install` @ root only
Copy apps/skye-hosts-api/.local.env.example -> .local.env
Copy apps/skye-hosts-api/.e2e.env.example -> .e2e.env
`npx env-cmd -f .env.e2e pnpm typeorm migration:run` (Seeds e2e db)

### Twilio Email Verification (SendGrid)

Twilio Verify sends OTP emails via SendGrid. After setting up the Twilio Verify service:

1. In [SendGrid](https://app.sendgrid.com) → **Settings → Sender Authentication**, verify the sender identity for your from address (single sender or domain authentication)
2. In [Twilio Console](https://console.twilio.com) → **Verify → Services → [your service] → Email tab**:
   - Toggle Email on
   - Click **Set up email integration** and connect your SendGrid API key
   - Set **From Email** to exactly match your verified SendGrid sender identity
   - Set **From Name** (e.g. `Skye Hosts`)
   - Ensure your SendGrid dynamic template contains the `{{otp}}` placeholder

When native modules in host app change:
npx expo run:android

# Create environment files

cp all .local.env.example files

```

## Development

# Start DB in docker

# Run all applications in development mode
pnpm dev

# Run a specific application
pnpm db
pnpm db-down
pnpm --filter=skye-hosts-api dev
pnpm --filter=skye-hosts-guest-website dev
pnpm --filter=skye-glamping-website dev
pnpm --filter=skye-hosts-app dev # Supports native modules

If changed native modules, the flow is:
1. pnpm --filter=skye-hosts-app eas-build-local
2. pnpm --filter=skye-hosts-app install-local
3. pnpm --filter=skye-hosts-app dev → press a — starts the JS bundler and opens the app

# Check for lint errors & auto fix, fixable lint errors:
pnpm --filter=skye-hosts-api lint

# Migration - Generate
pnpm --filter=skye-hosts-api migration:generate src/migrations/name

NB when pushing, a husky script runs pnpm build which requires that your API is still running due to ISR requests
```

## Environment variables

- skye-hosts-api
  - Locally: Uses .env.local
  - CI: Uses setup-jest.mjs
  - Production: Set via Browser in Heroku dashboard.
- vercel projects
  - Locally: Uses: .env.local
  - CI: (TBD)
  - Production: Set via Browser in Vercel dashboard (Team & project level)
- skye-hosts-app
  - Locally: Uses .env.local
  - Production:
    - insensitive: eas.json, app.json
    - sensitive: secrets stored in Expo cloud

## If app encountering network failuers when run inside Emulator

- Cold boot the emulator (wipe cache) — Android Studio > Device Manager > Cold Boot
  - Suspect this needs done anytime you change wifi networks
- Open Chrome on emulator, go to google.com, see if it loads

## How to add photos to Android emulator

adb push 1.jpg /sdcard/DCIM/Camera
adb shell am broadcast -a android.intent.action.MEDIA_SCANNER_SCAN_FILE -d file:///sdcard/DCIM/Camera/1.jpg

## How to update app icons (skye-hosts-app)

Two scripts handle icon generation — one for the main app icon and one for the Android monochrome (themed) icon, since they require different source images.

### Main icon

```bash
pnpm --filter skye-hosts-app generate-icons ../../temp/app_icon.png
```

**Source image requirements:**

- PNG format
- Minimum 1024x1024 pixels
- Square aspect ratio (1:1)
- Non-transparent — full icon with solid background

**Outputs** (written to `apps/skye-hosts-app/assets/`):

| File                          | Used by                                |
| ----------------------------- | -------------------------------------- |
| `icon.png`                    | iOS app icon                           |
| `android-icon-foreground.png` | Android adaptive icon foreground layer |
| `android-icon-background.png` | Android adaptive icon background layer |

### Monochrome icon (Android 13+ themed icons)

```bash
pnpm --filter skye-hosts-app generate-icons:monochrome ../../temp/app_icon_monochrome.png
```

When users enable "Themed icons" on Android 13+, the OS tints this image to match their wallpaper colour palette. It must be a silhouette so the tinting works correctly.

**Source image requirements:**

- PNG format
- Minimum 1024x1024 pixels
- Square aspect ratio (1:1)
- **Transparent background** — logo/silhouette only (white or black shape on transparent)

**Output** (written to `apps/skye-hosts-app/assets/`):

| File                          | Used by                                               |
| ----------------------------- | ----------------------------------------------------- |
| `android-icon-monochrome.png` | Android adaptive icon monochrome layer (themed icons) |

### After updating icons

Rebuild via EAS. On Android, uninstall the previous build before installing to clear the cached icon. Expo generates all platform-specific sizes from these source files at build time.

## How to deploy host app to real device locally from Expo

- Only needed very first time
  - npx expo install expo-dev-client
- Then:
  - pnpm --filter=skye-hosts-app eas-build-local
  - pnpm --filter=skye-hosts-app deploy-local
  - pnpm --filter=skye-hosts-app dev

## How to get logs from real apk on real device via USB when it crashes on startup

- adb logcat -c && adb logcat > crash.log #clears everything
- open app
- hit ctrl + c
- grep -i "fatal\|AndroidRuntime\|CRASH\|skyehosts" crash.log

## How to stream logs from real apk on real device via USB

- adb logcat --pid=$(adb shell pidof -s uk.co.skyehosts)

## How to deploy host app to EAS / Expo

Trigger builds via GitHub Actions:

1. Go to Actions > "EAS Build" workflow
2. Click "Run workflow"
3. Select platform (android/ios/all) and profile (development/preview/beta/production)

### Build profiles

| Profile       | Distribution                       | Use case                                                  |
| ------------- | ---------------------------------- | --------------------------------------------------------- |
| `development` | EAS internal                       | Local dev with dev-client                                 |
| `preview`     | EAS internal                       | Quick internal testing (no deep links)                    |
| `beta`        | Store (TestFlight / Play internal) | Deep link / universal link testing without public release |
| `production`  | Store                              | Public App Store / Play Store release                     |

### Deploying a beta build for deep link testing

Use the `beta` profile to produce a store-signed binary that supports universal links/app links, distributed only to yourself via TestFlight (iOS) or Play Console internal testing track (Android) — no public release required.

1. Trigger the "EAS Build" workflow with **profile: beta** and desired platform
2. **iOS**: Download the `.ipa` from the EAS build page and upload to App Store Connect → TestFlight → Internal Testing. Add yourself as a tester.
3. **Android**: Download the `.aab` from the EAS build page and upload to Play Console → Internal Testing. Add your Google account as a tester.
4. Install via TestFlight app (iOS) or the Play Store internal testing link (Android)

> Universal links only work on store-distributed builds. The `preview` profile uses EAS internal distribution which does **not** trigger iOS/Android deep link verification.
