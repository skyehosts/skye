## Add a workspace package as a dependency

Use the `workspace:*` suffix — without it pnpm looks the name up in the npm registry and fails.

pnpm --filter='<package>' add '@repo/whatever@workspace:\*'

Example:
pnpm --filter='@repo/skye-hosts-api-client' add '@repo/common@workspace:\*'
