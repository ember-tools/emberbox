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

SIGN_RECOMMENDATIONS_URL="https://lv-saarland.drk.de/fileadmin/user_upload/Taktische_Zeichen_im_Bev%C3%B6lkerungsschutz_Druck_A5.pdf"

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
  ui-test         vitest for @emberbox/ui
  ui-icons        Check that OWN_ICONS lists exactly the icons the lib components use
  ui-logos        Regenerate the logo SVGs and PNGs in packages/ui/logos
  ui-probe        Pack @emberbox/ui, install it into the empty app in probe/, build, prerender and
                  type check it; EMBERBOX_PROBE_KEEP=1 keeps the temp directory
  hub-dev         Vite dev server of the hub; the pattern page is at /pattern
  hub-typecheck   vue-tsc for the hub
  hub-build       Type check and production build of the hub
  hub-image       Build the hub container image locally as emberbox-hub:local
  sign-references Download the BBK recommendations on tactical signs into .references/ (ignored) and
                  render the pages the test bench at /pattern/signs cites, to check the drawings
  lint-test       Tests of @emberbox/lint
  lint            emberbox-lint in the lint package, the library and the hub
  lint-probe      Pack @emberbox/lint, install it into the project in probe-lint/, run every linter
                  and check that a stray comment and a retired storage key fail;
                  EMBERBOX_PROBE_KEEP=1 keeps the directory
  verify          ui-build, ui-typecheck, ui-icons, lint-test, lint and hub-build
TEXT
}

command="${1:-help}"
shift || true

case "$command" in
    install) run npm install "$@" ;;
    install-clean) run npm ci "$@" ;;
    ui-build) run npm run -w @emberbox/ui build ;;
    ui-typecheck) run npm run -w @emberbox/ui typecheck ;;
    ui-test) run npm run -w @emberbox/ui test ;;
    ui-icons) run npm run -w @emberbox/ui icons ;;
    ui-logos) run npm run -w @emberbox/ui logos ;;
    lint-probe)
        target="$(mktemp -d)"
        [ -n "${EMBERBOX_PROBE_KEEP:-}" ] || trap 'rm -rf "$target"' EXIT
        run npm pack -w @emberbox/lint --pack-destination "$target" >/dev/null
        mv "$target"/emberbox-lint-*.tgz "$target/emberbox-lint.tgz"
        cp -r probe-lint "$target/probe-lint"
        cd "$target/probe-lint"
        run npm install --no-audit --no-fund
        run npx emberbox-lint
        printf 'export const stray = 1 // remark\n' > src/stray.ts
        status=0
        output="$(run npx emberbox-lint comments 2>&1)" || status=$?
        if [ "$status" -ne 1 ] || ! grep -q "src/stray.ts" <<<"$output"; then
            echo "lint-probe: the comment check did not reject the stray comment (exit $status)" >&2
            exit 1
        fi
        rm src/stray.ts
        printf "export const old = localStorage.getItem('probe.old_ABC')\n" > src/reads-retired.ts
        status=0
        output="$(run npx emberbox-lint browser-storage 2>&1)" || status=$?
        if [ "$status" -ne 1 ] || ! grep -q "is retired" <<<"$output"; then
            echo "lint-probe: the storage check did not reject a retired key (exit $status)" >&2
            exit 1
        fi
        ;;
    ui-probe)
        "$0" ui-build
        target="$(mktemp -d)"
        [ -n "${EMBERBOX_PROBE_KEEP:-}" ] || trap 'rm -rf "$target"' EXIT
        run npm pack -w @emberbox/ui --pack-destination "$target" >/dev/null
        mv "$target"/emberbox-ui-*.tgz "$target/emberbox-ui.tgz"
        cp -r probe "$target/probe"
        cd "$target/probe"
        run npm install --no-audit --no-fund
        run npx vite build
        run node check.mjs
        run node without-url.mjs
        run npx vue-tsc --noEmit
        ;;
    hub-dev) "$0" ui-build && run npm run -w @emberbox/hub dev -- "$@" ;;
    hub-typecheck) run npm run -w @emberbox/hub typecheck ;;
    hub-build) run npm run -w @emberbox/hub build ;;
    sign-references)
        mkdir -p "$ROOT/.references"
        pdf="$ROOT/.references/taktische-zeichen-2024.pdf"
        if [ ! -f "$pdf" ]; then
            curl -fsSL -o "$pdf.part" "$SIGN_RECOMMENDATIONS_URL"
            mv "$pdf.part" "$pdf"
        fi
        pages=("$@")
        [ ${#pages[@]} -gt 0 ] || pages=(14 15 16 17 20 21 32 33 34 37)
        for page in "${pages[@]}"; do
            [[ "$page" =~ ^[0-9]+$ ]] || { echo "Not a page number: $page" >&2; exit 2; }
            run pdftoppm -f $((page + 2)) -l $((page + 2)) -r 110 -singlefile -png "$pdf" "$ROOT/.references/page-$page"
        done
        echo "Pages are in $ROOT/.references"
        ;;
    hub-image) docker build -f hub/Dockerfile --build-arg COMMIT="$(git rev-parse --short HEAD)" -t emberbox-hub:local . ;;
    lint-test) run npm run -w @emberbox/lint test ;;
    lint)
        for workspace in packages/lint packages/ui hub; do
            (cd "$ROOT/$workspace" && run node "$ROOT/packages/lint/src/cli/main.mjs" "$@") || failed=1
        done
        exit "${failed:-0}"
        ;;
    verify)
        "$0" ui-build
        "$0" ui-typecheck
        "$0" ui-test
        "$0" ui-icons
        "$0" lint-test
        "$0" lint
        "$0" hub-build
        ;;
    help | -h | --help) usage ;;
    *)
        echo "toolchain: unknown command '$command'" >&2
        usage >&2
        exit 1
        ;;
esac
