FROM node:24-alpine AS build
WORKDIR /build
COPY package.json package-lock.json ./
COPY packages/ui/package.json packages/ui/
COPY hub/package.json hub/
RUN npm ci --no-audit --no-fund
COPY packages/ui packages/ui
COPY hub hub
ARG COMMIT=dev
ARG BUILD_TIME
RUN npm run -w @emberbox/ui build \
    && COMMIT="$COMMIT" BUILD_TIME="$BUILD_TIME" npm run -w @emberbox/hub build

FROM caddy:2-alpine
COPY hub/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /build/hub/dist /srv
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost/build.json >/dev/null || exit 1
