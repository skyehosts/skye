# Image Upload Frontend Setup

## EAS Rebuild Required

`expo-image-picker` requires native permissions. Run a new dev client build:

```bash
eas build --local --profile development --platform all
```

## App Config Permissions

Ensure the following are in `app.json` or `app.config.js`:

- `NSPhotoLibraryUsageDescription` — iOS photo library access
- Android: `READ_MEDIA_IMAGES` permission (Expo handles this automatically via the plugin)

If using `app.json`, add under `expo.ios.infoPlist`:

```json
{
  "NSPhotoLibraryUsageDescription": "We need access to your photos so you can add images to your listing."
}
```

Or if using the expo-image-picker plugin in `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-image-picker",
        {
          "photosPermission": "We need access to your photos so you can add images to your listing."
        }
      ]
    ]
  }
}
```
