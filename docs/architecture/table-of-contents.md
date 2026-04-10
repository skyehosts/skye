# Architecture Documentation

High-level documentation of key features and systems. These docs focus on critical journeys, unintuitive or concealed logic, and non-obvious design decisions — not exhaustive API references.

## Files

| File                                                           | Feature                                                                            |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| [calendar-availability.md](./calendar-availability.md)         | Calendar availability model, manual blocking, drag-to-select                       |
| [calendar-sync.md](./calendar-sync.md)                         | External calendar sync (import/export, auto-disable, orphaned blocks)              |
| [listing-amenities-display.md](./listing-amenities-display.md) | Guest website amenities section — icon mapping, data flow, modal                   |
| [listing-deletion.md](./listing-deletion.md)                   | Listing deletion flow, FK constraint order, confirmation UI                        |
| [listing-things-to-know.md](./listing-things-to-know.md)       | Guest listing detail "Things to know" — house rules, safety, responsive layout     |
| [theme-tokens.md](./theme-tokens.md)                           | Shared design tokens package (`@repo/theme`) — spacing, border-radius, font-weight |
