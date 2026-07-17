FROM node:20-alpine AS builder
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install turbo
RUN npm install -g turbo

COPY . .

# Build the server application
RUN turbo run build --filter=server...

# Setup production environment
FROM node:20-alpine AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs

# Copy workspaces dependencies
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/packages/database/package.json ./packages/database/package.json
COPY --from=builder /app/packages/database/src ./packages/database/src
COPY --from=builder /app/packages/shared/package.json ./packages/shared/package.json
COPY --from=builder /app/packages/shared/src ./packages/shared/src

# Copy server application
COPY --from=builder /app/apps/server/src ./apps/server/src
COPY --from=builder /app/apps/server/package.json ./apps/server/package.json

# Install only production dependencies
RUN npm install --omit=dev

USER expressjs
EXPOSE 5000
ENV PORT=5000

# Notice how the context changes when working with monorepo containers
# It might require running from root depending on workspace setup.
# Start the server from the workspace root.
CMD ["npm", "start", "--workspace=apps/server"]
