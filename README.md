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
1. eas build --profile development --platform android --local --output ./builds/app.apk
2. adb install builds/app.apk — install it on the emulator
3. pnpm dev → press a — starts the JS bundler and opens the app

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
  - CI: (TBD)
  - Production: Set via Browser in Expo dashboard

## How to deploy host app to EAS / Expo

Trigger builds via GitHub Actions:

1. Go to Actions > "EAS Build" workflow
2. Click "Run workflow"
3. Select platform (android/ios/all) and profile (development/preview/beta/production)

### Build profiles

| Profile | Distribution | Use case |
|---|---|---|
| `development` | EAS internal | Local dev with dev-client |
| `preview` | EAS internal | Quick internal testing (no deep links) |
| `beta` | Store (TestFlight / Play internal) | Deep link / universal link testing without public release |
| `production` | Store | Public App Store / Play Store release |

### Deploying a beta build for deep link testing

Use the `beta` profile to produce a store-signed binary that supports universal links/app links, distributed only to yourself via TestFlight (iOS) or Play Console internal testing track (Android) — no public release required.

1. Trigger the "EAS Build" workflow with **profile: beta** and desired platform
2. **iOS**: Download the `.ipa` from the EAS build page and upload to App Store Connect → TestFlight → Internal Testing. Add yourself as a tester.
3. **Android**: Download the `.aab` from the EAS build page and upload to Play Console → Internal Testing. Add your Google account as a tester.
4. Install via TestFlight app (iOS) or the Play Store internal testing link (Android)

> Universal links only work on store-distributed builds. The `preview` profile uses EAS internal distribution which does **not** trigger iOS/Android deep link verification.
