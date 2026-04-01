# Calendar Sync: Environment Variables

Add the following env var to your local `.env.local` and deployed environments:

## `API_BASE_URL`

The public base URL of the API (used to generate iCal export URLs).

- **Local**: `http://localhost:3000`
- **QA**: Your QA API URL (e.g. `https://api-qa.skyehosts.co.uk`)
- **Production**: Your production API URL (e.g. `https://api.skyehosts.co.uk`)

Add to:

- `apps/skye-hosts-api/.env.local` (local dev)
- `apps/skye-hosts-api/.env.e2e` (e2e tests)
- Deployed environment variables (Heroku/AWS)
