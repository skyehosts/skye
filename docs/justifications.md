## turbo lint --force (local only)

`pnpm lint` passes `--force` to turbo when not in CI. This bypasses turbo's lint cache locally,
ensuring stale cached results never mask real lint errors. CI always has a clean cache so the
flag is unnecessary there.
