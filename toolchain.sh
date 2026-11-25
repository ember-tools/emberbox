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
  hub-dev         Vite dev server of the hub; the pattern page is at /muster
  hub-typecheck   vue-tsc for the hub
  hub-build       Type check and production build of the hub
  verify          ui-build, ui-typecheck and hub-build
TEXT
}

command="${1:-help}"
shift || true

case "$command" in
    install) run npm install "$@" ;;
    install-clean) run npm ci "$@" ;;
    ui-build) run npm run -w @emberbox/ui build ;;
    ui-typecheck) run npm run -w @emberbox/ui typecheck ;;
    hub-dev) "$0" ui-build && run npm run -w @emberbox/hub dev -- "$@" ;;
    hub-typecheck) run npm run -w @emberbox/hub typecheck ;;
    hub-build) run npm run -w @emberbox/hub build ;;
    verify)
        "$0" ui-build
        "$0" ui-typecheck
        "$0" hub-build
        ;;
    help | -h | --help) usage ;;
    *)
        echo "toolchain: unknown command '$command'" >&2
        usage >&2
        exit 1
        ;;
esac
