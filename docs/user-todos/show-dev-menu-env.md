# SHOW_DEV_MENU env var

A new env var `SHOW_DEV_MENU` controls whether the Style Guide / Demo Form menu section in the host app's "More" tab is visible.

- It is already set to `"true"` in `apps/skye-hosts-app/eas.json` for the `development` and `preview` build profiles, so EAS builds need no extra action.
- It is intentionally **omitted** from `beta` and `production` profiles so the dev menu stays hidden in store releases.
- If you run the app locally with a `.env` file (e.g. `apps/skye-hosts-app/.env`), add `SHOW_DEV_MENU=true` if you want the dev menu visible outside `__DEV__` mode. (Local `expo start --dev-client` already shows it because `__DEV__` is `true`.)
