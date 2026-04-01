##################
# BUILD BASE IMAGE
##################

FROM node:24-alpine AS base

# Install pnpm
RUN npm install -g pnpm@10.11.0

#####################
# BUILD BUILDER IMAGE
#####################

FROM base AS builder
WORKDIR /app

# Copy workspace root files needed for pnpm install
COPY --chown=node:node package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./

# Copy all workspace package.json files (pnpm needs them to resolve the lockfile)
COPY --chown=node:node apps/skye-hosts-api/package.json ./apps/skye-hosts-api/package.json
COPY --chown=node:node apps/skye-hosts-guest-website/package.json ./apps/skye-hosts-guest-website/package.json
COPY --chown=node:node packages/common/package.json ./packages/common/package.json
COPY --chown=node:node packages/skye-hosts-api-client/ ./packages/skye-hosts-api-client/
COPY --chown=node:node packages/eslint-config/ ./packages/eslint-config/
COPY --chown=node:node packages/typescript-config/ ./packages/typescript-config/
COPY --chown=node:node packages/web/package.json ./packages/web/package.json
COPY --chown=node:node packages/theme/package.json ./packages/theme/package.json
COPY --chown=node:node packages/web-components/package.json ./packages/web-components/package.json

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy common source and build it
COPY --chown=node:node packages/common/ ./packages/common/
RUN pnpm --filter @repo/common build

# Build skye-hosts-api-client (source already copied above)
RUN pnpm --filter @repo/skye-hosts-api-client build

# Copy API source
COPY --chown=node:node apps/skye-hosts-api/ ./apps/skye-hosts-api/

# Build the API
RUN pnpm --filter skye-hosts-api build

# Prune to production dependencies
ENV NODE_ENV=production
RUN pnpm --filter skye-hosts-api --prod deploy --legacy /app/pruned

######################
# BUILD FOR PRODUCTION
######################

FROM node:24-alpine AS production
WORKDIR /app

RUN chown -R node:node /app

# Copy pruned production output
COPY --chown=node:node --from=builder /app/pruned/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/apps/skye-hosts-api/dist ./dist
COPY --chown=node:node --from=builder /app/apps/skye-hosts-api/package.json ./

USER node

# Start the server using the production build
CMD [ "node", "--max-old-space-size=400", "dist/main.js" ]
