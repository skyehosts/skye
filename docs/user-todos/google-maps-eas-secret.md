# Set Google Maps API Key as EAS Secret

The native Google Maps SDK keys have been moved from hardcoded values in `app.json` to `app.config.ts`, injected via `process.env.GOOGLE_MAPS_API_KEY`.

## Action required

Set the EAS secret so EAS builds can access the key:

```bash
eas secret:create --name GOOGLE_MAPS_API_KEY --value <your-api-key>
```

## Local development

Already handled — `.env.local` has `GOOGLE_MAPS_API_KEY` set.

## Google Cloud Console

Restrict the key by:

- **Android**: package name `uk.co.skyehosts` + SHA-1 fingerprint
- **iOS**: bundle ID `uk.co.skyehosts`
