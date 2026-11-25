FROM node:24-alpine AS bau
WORKDIR /bau
COPY package.json package-lock.json ./
COPY packages/ui/package.json packages/ui/
COPY hub/package.json hub/
RUN npm ci --no-audit --no-fund
COPY packages/ui packages/ui
COPY hub hub
ARG COMMIT=dev
ARG GEBAUT
RUN npm run -w @emberbox/ui build \
    && COMMIT="$COMMIT" GEBAUT="$GEBAUT" npm run -w @emberbox/hub build

FROM caddy:2-alpine
COPY hub/Caddyfile /etc/caddy/Caddyfile
COPY --from=bau /bau/hub/dist /srv
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost/fassung.json >/dev/null || exit 1
