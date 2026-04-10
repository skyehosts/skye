# Action required: Rebuild skye-hosts-app dev client

Added `react-native-keyboard-controller` to fix the soft keyboard obscuring form fields on Android (and to give consistent keyboard handling on iOS too).

This is a **native module**, so the JS-only dev client cannot load it — you must produce a new dev client build before running the app.

## Steps

1. Build a new dev client:
   ```
   pnpm --filter skye-hosts-app build:dev:android
   pnpm --filter skye-hosts-app build:dev:ios
   ```
   (or `eas-build-local` for a local Android APK)
2. Install the new dev client on your device(s).
3. Run `pnpm --filter skye-hosts-app dev` as normal.

No env vars or config to add.

## What changed

- `KeyboardProvider` mounted at the root in `app/_layout.tsx`.
- `ScreenContainer` now accepts `avoidKeyboard` (and `keyboardBottomOffset`). When enabled it wraps content in `KeyboardAwareScrollView` from `react-native-keyboard-controller`, which auto-scrolls the focused input above the keyboard on both iOS and Android.
- `ScreenContainer` also accepts an optional `header` prop — anything passed here renders as a fixed top element above the keyboard-avoiding body (e.g. an `Appbar.Header` that should stay pinned).
- Enabled on `pin-setup`, `pin-unlock`, and `change-pin` (which passes its `Appbar.Header` via the new `header` prop).

## Adopting on other screens

For any screen with a `TextInput` that might be obscured by the keyboard, simply pass `avoidKeyboard` to `<ScreenContainer>`:

```tsx
<ScreenContainer avoidKeyboard>...</ScreenContainer>
```

If the screen has a top app bar that should stay pinned, pass it via the `header` prop (see `change-pin.tsx`):

```tsx
<ScreenContainer
  avoidKeyboard
  header={
    <Appbar.Header>
      <Appbar.BackAction onPress={() => router.back()} />
      <Appbar.Content title="..." />
    </Appbar.Header>
  }
>
  ...
</ScreenContainer>
```
