# BookSkye API

## Installation

```bash
# Install dependencies
pnpm install

# Create environment file
cp .env.example .env

# Edit environment variables in .env
```

## Development

```bash
# Run in development mode
pnpm --filter=book-skye-api start:dev

# Run with hot-reload
pnpm --filter=book-skye-api start:debug

```

## Build

```bash
# Build application
pnpm --filter=book-skye-api build

# Run in production mode
pnpm --filter=book-skye-api start:prod
```

## Testing

```bash
# Run unit tests
pnpm --filter=book-skye-api test

# Run e2e tests
pnpm --filter=book-skye-api test:e2e

# Check test coverage
pnpm --filter=book-skye-api test:cov
```
