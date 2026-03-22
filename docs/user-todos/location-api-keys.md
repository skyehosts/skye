# Location Feature — API Keys Setup

## Google Cloud Platform

1. Go to Google Cloud Console > APIs & Services > Enable APIs
2. Enable these APIs:
   - Maps SDK for Android
   - Maps SDK for iOS
   - Maps Static API
   - Geocoding API

3. Create API keys:

| Key                                  | Usage                                                                      | Restriction                                              |
| ------------------------------------ | -------------------------------------------------------------------------- | -------------------------------------------------------- |
| `GOOGLE_MAPS_API_KEY`                | Host app (added to `app.config.ts` extra)                                  | Bundle ID restriction: `uk.co.skyehosts` (Android + iOS) |
| `GOOGLE_MAPS_API_KEY_IOS`            | Replace placeholder in `app.json` > ios > config > googleMapsApiKey        | iOS bundle ID: `uk.co.skyehosts`                         |
| `GOOGLE_MAPS_API_KEY_ANDROID`        | Replace placeholder in `app.json` > android > config > googleMaps > apiKey | Android package: `uk.co.skyehosts`                       |
| `NEXT_PUBLIC_GOOGLE_MAPS_STATIC_KEY` | Guest website `.env`                                                       | HTTP referrer restriction (your domain)                  |

## Mapbox

1. Create a Mapbox account at https://mapbox.com
2. Create an access token
3. Add URL restriction for your domain

| Key                               | Usage                |
| --------------------------------- | -------------------- |
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | Guest website `.env` |

## Environment Variables to Add

### Host App (EAS secrets or `.env`)

- `GOOGLE_MAPS_API_KEY` — used for geocoding in the app

### Guest Website (`.env.local`)

- `NEXT_PUBLIC_GOOGLE_MAPS_STATIC_KEY` — static map images on listing page
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` — interactive map modal

### app.json Placeholders

Replace the placeholder values in `app.json`:

- `GOOGLE_MAPS_API_KEY_IOS` — iOS Google Maps SDK key
- `GOOGLE_MAPS_API_KEY_ANDROID` — Android Google Maps SDK key

## EAS Rebuild Required

After adding the Google Maps native SDK keys, an EAS rebuild is needed for both iOS and Android since `react-native-maps` requires native code.

```bash
eas build --platform all --profile development
```
