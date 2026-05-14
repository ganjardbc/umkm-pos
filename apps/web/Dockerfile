FROM node:22-alpine AS build
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages/shared-types/package.json packages/shared-types/package.json
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm --filter @umkm-pos/shared-types build \
  && pnpm --filter umkm-pos-app build

FROM nginx:stable-alpine AS production
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
