# Build stage
FROM node:24-alpine AS builder
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/ ./packages/
RUN pnpm install --frozen-lockfile
COPY apps/api/ ./apps/api/
WORKDIR /app/apps/api
RUN pnpm prisma generate
RUN pnpm build

# Deploy stage
FROM node:24-alpine AS deploy
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
WORKDIR /app
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
RUN pnpm install --frozen-lockfile --prod
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/apps/api/prisma.config.ts ./apps/api/prisma.config.ts
WORKDIR /app/apps/api
# Must match @prisma/client version in lockfile (7.8.0)
RUN npx prisma@7.8.0 generate

# Runtime stage
FROM node:24-alpine
WORKDIR /app
COPY --from=deploy /app ./
COPY --from=builder /app/apps/api/prisma.config.ts ./apps/api/prisma.config.ts
WORKDIR /app/apps/api
EXPOSE 3000
CMD ["node", "dist/src/main.js"]
