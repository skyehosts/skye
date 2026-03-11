import { withSentryConfig } from '@sentry/nextjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const monorepoRoot = path.resolve(__dirname, '../..');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  outputFileTracingRoot: monorepoRoot,
  compiler: {
    emotion: {
      autoLabel: 'dev-only',
      labelFormat: '[dirname]--[local]',
    },
  },
  turbopack: {
    root: monorepoRoot,
  }
};

export default withSentryConfig(nextConfig, {
  silent: true,
});
