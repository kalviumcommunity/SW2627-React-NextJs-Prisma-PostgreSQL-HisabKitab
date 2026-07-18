FROM node:20-alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy root package files for workspace resolution
COPY package.json package-lock.json ./

# Copy workspace package.json files
COPY apps/server/package.json ./apps/server/package.json
COPY packages/database/package.json ./packages/database/package.json
COPY packages/shared/package.json ./packages/shared/package.json

# Copy Prisma schema (needed for prisma generate)
COPY packages/database/prisma ./packages/database/prisma

# Install ALL dependencies (prisma is a devDependency, needed for generate)
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate --schema=packages/database/prisma/schema.prisma

# Copy source code
COPY packages/database/src ./packages/database/src
COPY packages/shared/src ./packages/shared/src
COPY apps/server/src ./apps/server/src

# Remove devDependencies after prisma generate is done
RUN npm prune --omit=dev

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 expressjs

USER expressjs

EXPOSE 5000
ENV PORT=5000
ENV NODE_ENV=production

CMD ["node", "apps/server/src/index.js"]
