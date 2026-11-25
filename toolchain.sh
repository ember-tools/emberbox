#!/usr/bin/env bash
#
# Build and verification commands for this repository.
#
# Every command runs from the repository root and inside the nix environment of shell.nix via
# `direnv exec`, so node comes from the nix environment.
#
# Usage: ./toolchain.sh <command> [args...]
#        ./toolchain.sh help

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

run() {
    if [ -f "$ROOT/.envrc" ] && command -v direnv >/dev/null 2>&1; then
        direnv exec "$ROOT" "$@"
    else
        "$@"
    fi
}

usage() {
    cat <<'TEXT'
Usage: ./toolchain.sh <command> [args...]

  install         npm install
  install-clean   npm ci
  ui-build        Build the Vite plugin of @emberbox/ui
  ui-typecheck    vue-tsc for @emberbox/ui
  ui-icons        Check that EIGENE_ICONS lists exactly the icons the lib components use
  ui-logos        Regenerate the logo SVGs and PNGs in packages/ui/logos
  ui-probe        Pack @emberbox/ui, install it into the empty app in probe/, build, prerender and
                  type check it; EMBERBOX_PROBE_BEHALTEN=1 keeps the temp directory
  hub-dev         Vite dev server of the hub; the pattern page is at /muster
  hub-typecheck   vue-tsc for the hub
  hub-build       Type check and production build of the hub
  hub-image       Build the hub container image locally as emberbox-hub:lokal
  verify          ui-build, ui-typecheck, ui-icons and hub-build
TEXT
}

command="${1:-help}"
shift || true

case "$command" in
    install) run npm install "$@" ;;
    install-clean) run npm ci "$@" ;;
    ui-build) run npm run -w @emberbox/ui build ;;
    ui-typecheck) run npm run -w @emberbox/ui typecheck ;;
    ui-icons) run npm run -w @emberbox/ui icons ;;
    ui-logos) run npm run -w @emberbox/ui logos ;;
    ui-probe)
        "$0" ui-build
        ziel="$(mktemp -d)"
        [ -n "${EMBERBOX_PROBE_BEHALTEN:-}" ] || trap 'rm -rf "$ziel"' EXIT
        run npm pack -w @emberbox/ui --pack-destination "$ziel" >/dev/null
        mv "$ziel"/emberbox-ui-*.tgz "$ziel/emberbox-ui.tgz"
        cp -r probe "$ziel/probe"
        cd "$ziel/probe"
        run npm install --no-audit --no-fund
        run npx vite build
        run node pruefen.mjs
        run node ohne-adresse.mjs
        run npx vue-tsc --noEmit
        ;;
    hub-dev) "$0" ui-build && run npm run -w @emberbox/hub dev -- "$@" ;;
    hub-typecheck) run npm run -w @emberbox/hub typecheck ;;
    hub-build) run npm run -w @emberbox/hub build ;;
    hub-image) docker build -f hub/Dockerfile --build-arg COMMIT="$(git rev-parse --short HEAD)" -t emberbox-hub:lokal . ;;
    verify)
        "$0" ui-build
        "$0" ui-typecheck
        "$0" ui-icons
        "$0" hub-build
        ;;
    help | -h | --help) usage ;;
    *)
        echo "toolchain: unknown command '$command'" >&2
        usage >&2
        exit 1
        ;;
esac
