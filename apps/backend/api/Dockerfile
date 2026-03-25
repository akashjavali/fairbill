FROM node:20-alpine AS base
RUN npm install -g pnpm@9
WORKDIR /app

# Install dependencies only when needed
FROM base AS deps
COPY package.json pnpm-lock.yaml* ./
COPY apps/backend/api/package.json ./apps/backend/api/
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/
COPY packages/config/package.json ./packages/config/
RUN pnpm install --frozen-lockfile --filter @fairbill/api...

# Build stage
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm --filter @fairbill/types build
RUN pnpm --filter @fairbill/utils build
RUN pnpm --filter @fairbill/api build
RUN pnpm --filter @fairbill/api exec prisma generate

# Production stage
FROM node:20-alpine AS runner
RUN npm install -g pnpm@9
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/apps/backend/api/dist ./dist
COPY --from=builder /app/apps/backend/api/prisma ./prisma
COPY --from=builder /app/apps/backend/api/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 4000

CMD ["node", "dist/server.js"]
