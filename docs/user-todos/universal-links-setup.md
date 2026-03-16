# Universal Links Setup for Co-Host Invites

## Environment Variables

- Add `APP_LINK_BASE_URL=https://skyehosts.co.uk` to all deployed environments (QA, staging, production)

## Apple (iOS Universal Links)

- Replace `TEAM_ID` in `apps/skye-hosts-guest-website/app/.well-known/apple-app-site-association/route.ts` with your Apple Developer Team ID
  - Find it at: https://developer.apple.com/account → Membership Details

## Android (App Links)

- Replace `TODO:REPLACE_WITH_SHA256_FINGERPRINT_FROM_PLAY_CONSOLE` in `apps/skye-hosts-guest-website/app/.well-known/assetlinks.json/route.ts` with the SHA-256 fingerprint of your Android signing certificate
  - Find it in: Google Play Console → App → Setup → App signing → SHA-256 certificate fingerprint

## App Store URLs

- Replace `TODO_APP_ID` in `apps/skye-hosts-guest-website/app/invite/page.tsx` with the actual Apple App Store app ID once published

## Native Rebuild Required

- The `associatedDomains` (iOS) and `intentFilters` (Android) changes in `app.json` require a native rebuild
- Run an EAS build for both platforms: `eas build --platform all`

## Post-Deployment Verification

1. Verify AASA: `curl https://skyehosts.co.uk/.well-known/apple-app-site-association`
2. Verify assetlinks: `curl https://skyehosts.co.uk/.well-known/assetlinks.json`
3. Use Apple's validator: https://search.developer.apple.com/appsearch-validation-tool/
4. Use Google's validator: https://developers.google.com/digital-asset-links/tools/generator

## Getting a Beta Build onto Your Device for Testing

### Prerequisites

Before building, complete the AASA/assetlinks steps above and deploy them to production so the `.well-known` files are live.

### iOS — TestFlight

1. **Apple Developer account** — ensure you have an active Apple Developer Program membership (paid, $99/yr) at developer.apple.com
2. **App Store Connect app record** — go to appstoreconnect.apple.com → Apps → New App. Fill in bundle ID (must match `app.json`), name, SKU. You do **not** need to submit it for review.
3. **Trigger beta build** — run the GitHub Actions "EAS Build" workflow with **profile: beta**, **platform: ios**
4. **Upload to TestFlight** — once the build completes in EAS, download the `.ipa` and upload via Xcode → Window → Organizer, or via `xcrun altool`. Alternatively, EAS can auto-submit if you configure App Store Connect API keys in your EAS project secrets.
5. **Add yourself as internal tester** — in App Store Connect → TestFlight → Internal Testing → add your Apple ID
6. **Install** — open the TestFlight app on your iPhone and install the build

> iOS fetches the AASA file at install time — the `.well-known/apple-app-site-association` endpoint must be live before you install the build.

### Android — Play Console Internal Testing

1. **Google Play Developer account** — ensure you have an active Google Play Developer account (one-time $25 fee) at play.google.com/console
2. **Create app record** — Play Console → Create app. Fill in app name, default language, app/game toggle. You do **not** need to publish it.
3. **Enable Play App Signing** — Play Console → Setup → App signing → opt in. This generates the SHA-256 fingerprint you need for `assetlinks.json` (copy it now if not already done).
4. **Trigger beta build** — run the GitHub Actions "EAS Build" workflow with **profile: beta**, **platform: android**
5. **Upload to internal testing track** — Play Console → Testing → Internal testing → Create new release → upload the `.aab` from the EAS build
6. **Add yourself as tester** — Internal testing → Testers tab → add your Google account email
7. **Install** — follow the opt-in link from the Testers tab on your Android device

> Android verifies `assetlinks.json` at link-click time (not install time), so the file just needs to be live before you test a deep link.

## Resend Email Template

- The invite links are now `https://skyehosts.co.uk/invite?token=TOKEN` instead of `skye-hosts://...`
- The Resend `co_host_invite` template should work as-is since it uses the `inviteLink` variable, but verify the template renders the https link correctly
