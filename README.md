# Emberbox

Tools for fire brigade training and exercises, under one roof at
[emberbox.app](https://emberbox.app). The tools themselves are in German.

This repository contains:

- **`packages/ui`** – `@emberbox/ui`, the shared look of the Emberbox tools. Built on
  [Nuxt UI](https://ui.nuxt.com), it brings Nuxt UI's components in the Emberbox style.
- **`packages/lint`** – `@emberbox/lint`, the shared linters: an ESLint config with the Emberbox
  rules and `emberbox-lint`, which also checks comments, em dashes, browser storage and duplication.
- **`hub`** – the emberbox.app start page.

## Development

Requires [Nix](https://nixos.org) with direnv; `shell.nix` provides Node.

```sh
./toolchain.sh install
./toolchain.sh hub-dev      # pattern page at http://localhost:5173/pattern
./toolchain.sh lint         # emberbox-lint in the lint package, the library and the hub
./toolchain.sh lint-probe   # the packed @emberbox/lint in an empty project
./toolchain.sh verify       # everything CI checks
```

## Using `@emberbox/ui` in a tool

```ts
// vite.config.ts – replaces @tailwindcss/vite
import vue from '@vitejs/plugin-vue'
import {emberbox} from '@emberbox/ui/vite'
import {defineConfig} from 'vite'

export default defineConfig({plugins: [vue(), emberbox()]})
```

```css
/* style.css – brings Tailwind and Nuxt UI along */
@import "@emberbox/ui/style.css";
```

```ts
// main.ts
import {emberboxUi} from '@emberbox/ui'

createApp(App).use(router).use(emberboxUi).mount('#app')
```

```vue
<!-- App.vue -->
<script setup lang="ts">
import {AppFooter, AppHeader, EmberboxApp} from '@emberbox/ui'
</script>

<template>
  <EmberboxApp>
    <AppHeader name="Calltaker" subtitle="Notrufabfrage üben"/>
    <RouterView/>
    <AppFooter tool="Calltaker" source="https://github.com/ember-tools/calltaker"
               license="AGPL-3.0" help="/hilfe"/>
  </EmberboxApp>
</template>
```

`EmberboxApp` sets Nuxt UI to German and shows a banner as soon as a newer build is served. Tools
without vue-router use `emberbox({router: false})`. `AppFooter` links back to the Emberbox hub;
`backlink: false` turns that off. The tool's tsconfig lists `"types": ["vite/client", "@emberbox/ui/types"]`: the
first because the library ships as source and imports its logo with `?url`, the second for the
global types of everything Nuxt UI auto-imports. `emberbox()` therefore turns off Nuxt UI's own
`auto-imports.d.ts` and `components.d.ts`, so a tool keeps no generated type files. Only Nuxt
UI's components and composables are auto-imported; a tool imports its own components explicitly.
The types follow the Nuxt UI version a library release was built with, so a newer Nuxt UI
component is typed once the library is updated.

The commit and build time are available as `buildInfo` from `@emberbox/ui` and appear in the footer.
`emberbox()` reads them from `git` or, in an image build without `.git`, from the environment
variables `COMMIT` and `BUILD_TIME`:

```dockerfile
ARG COMMIT=dev
ARG BUILD_TIME
RUN COMMIT=$COMMIT BUILD_TIME=$BUILD_TIME npm run build
```

Every build contains `build.json`. The backend serves it at the root without caching
(`Cache-Control: no-store`), so open pages notice a new build.

Further building blocks: `CodeDisplay`, `useConfirm`, `usePolling` and the help components
`HelpPage`, `HelpSection`, `HelpTopic`, `HelpMockup`. Form fields with a label: `TextField` (with optional
suggestions), `TextAreaField`, `ComboboxField` (free text plus a suggestion list, optionally
filtered by the server), `YesNoField` (configurable values and labels), `DateTimeField` (date and
time as two strings in German notation) and `CollapsibleSection`, which remembers whether it was
open. Besides their own props the fields pass `class`, `hint`, `help`, `error` and
`required` on to the `UFormField` around them; all of them take `disabled`. The pattern page shows all of them.

Tactical symbols: `unitSymbolTree` draws a vehicle, container, trailer, boat, unit or dismounted
squad with its writing and size mark (Trupp, Staffel, Gruppe, Zug), `markSymbolTree` a place of an
incident (`INCIDENT_MARK_KINDS`) or a point of the water supply (`WATER_SUPPLY_MARK_KINDS`).
`TacticalSymbol` shows such a tree in the page (`symbol` prop), so the theme's signal red applies;
`unitSymbol` and `markSymbol` give the same symbols as SVG strings for map icons.

Tactical signs after the recommendations of the BBK (2024): `tacticalSignTree` builds a sign from
its building blocks (`TacticalSignSpec`: basic form, organisation colour in a filled, outline or
black and white style, unit size or association, supplementary signs, how a vehicle runs, what it
carries or how it flies, writing). `abilities` adds the symbols of chapter 4 (`ABILITIES`), stacked
from the bottom up; `designation`, `fieldB` and `fieldX` fill the corners, `level`, `strength`, `time`,
`identification` and `certainty` write around the sign and widen its canvas as needed, and
`figure` and `located` draw the places and command posts of annex D. `additionalSignTree` draws
the signs of 5.2, 5.7 and 5.8 that stand on their own (`ADDITIONAL_SIGNS`).
`TACTICAL_SIGN_CATALOG` lists the signs of chapters 1–6 and the fire service and command examples
of annexes C and D with number, name and printed page, plus the library's own water supply marks
as `W.1`–`W.5` with `recommended: false`; `catalogSignTree` draws any entry. Name
`CATALOG_SOURCE` wherever they are shown. The hub's test bench at `/pattern/signs` draws the
catalogue, and `./toolchain.sh sign-references` renders the pages of the recommendations into
`.references/` to compare.

## Polling and browser storage

```ts
const {connected, refresh, stop} = usePolling(fetchState, {intervalMs: 2000, maxIntervalMs: 10_000, hiddenIntervalMs: 30_000})
const poller = createPoller(exchange, {intervalMs: 2000, hiddenIntervalMs: 30_000})
cleanUpStorage({remove: ['tool_name_*'], move: {old_view: 'tool.view'}})
```

- `usePolling` polls while a component is mounted; `createPoller` is the same loop for a store, with `start`,
  `stop` and `refresh`. One request runs at a time, failures double the wait up to `maxIntervalMs`, and
  `refresh` resolves once a request started after the call has completed.
- A hidden tab pauses, or with `hiddenIntervalMs` keeps polling at that slower pace, for a heartbeat or
  a shared document that should not fall too far behind. Coming back polls at once.
- `cleanUpStorage` runs once at startup: it moves values from retired keys to their new names unless the new
  key is already set, and deletes keys or prefixes ending in `*` that the tool no longer reads. List both
  in `browser-storage.json` with `"retired": true`.

## Logo, app, SEO and prerendering

```ts
// vite.config.ts
emberbox({
    url: 'https://calltaker.emberbox.app',
    logo: 'calltaker',
    app: {name: 'Calltaker', description: 'Notrufannahme üben.'},
    prerender: {entry: 'src/prerender.ts', paths: ['/', '/hilfe']},
})
```

- `logo` puts `favicon.svg`, `apple-touch-icon.png`, `logo-192.png`, `logo-512.png`,
  `logo-maskable-192.png` and `logo-maskable-512.png` at the root and links the first two; the other
  four are the app icons, and `logo-512.png` is also the default preview image. `AppHeader` shows
  the logo with `logo="/favicon.svg"`.
- `app` makes the tool installable as an app: it writes `manifest.webmanifest` (standalone, starting
  at `/`, the logo as regular and maskable icon in 192 and 512 px) and links it with the theme colour.
  It needs `logo`. There is no service worker, so the installed app always loads from the server and
  updates arrive through the new-build banner as in the browser.
- `usePage({title, description, path, index, image, structuredData})` sets a page's title,
  description, canonical URL, OpenGraph and `robots`; `webApplicationData(...)` provides matching
  JSON-LD.
- `prerender` renders the public pages at build time to `dist/pages/<path>/index.html` and
  writes `sitemap.xml` and `robots.txt`. `dist/index.html` stays the empty shell for all other
  routes. The backend serves `pages/index.html` for `/`, `pages/hilfe/index.html` for `/hilfe`,
  and `index.html` otherwise.

```ts
// src/prerender.ts
import {renderPage} from '@emberbox/ui/prerender'

export async function render(path: string, template: string): Promise<string> {
    const router = createAppRouter(createMemoryHistory())
    const app = createSSRApp(App).use(router)
    await router.push(path)
    await router.isReady()
    return renderPage(app, template)
}
```

In the browser, `createToolApp(App)` creates the app so that it takes over prerendered HTML; wait for
`router.isReady()` before `mount`. Prerendered pages must not touch `window` or `document` during
setup, only in `onMounted`. `probe/` holds a complete example.

Primary buttons are ink black; red is available as the colour `signal` and for errors (`error`).
Icons come from Lucide (`i-lucide-*`) and are bundled at build time; nothing is fetched from the
Iconify API.

To try the library in a tool locally, pack it so its dependencies are installed in the tool:

```sh
./toolchain.sh ui-build
npm pack -w @emberbox/ui            # creates emberbox-ui-<version>.tgz
cd ../tool/frontend && npm install ../../emberbox/emberbox-ui-<version>.tgz
```

## Hub

The hub in `hub/` is fully prerendered and runs as a static site in a Caddy container behind
Traefik. The tools are listed in `hub/src/tools.ts`; a new tool is one more entry there. The
imprint and privacy policy cover all tools. The provider's name, address and e-mail and the access
log retention stay out of the repository: the pages load them from `/legal.json`, which the
deployment places in `config/legal.json` next to `compose.yml`, mounted at `/etc/emberbox` (see
`hub/legal.example.json`). Without it the
pages say the details could not be loaded.

```sh
./toolchain.sh hub-image                       # build the image locally
docker run --rm -p 8080:80 emberbox-hub:local   # view at http://localhost:8080
```

On `main`, CI builds the image `ghcr.io/ember-tools/emberbox-hub`. `hub/compose.yml` runs it
behind Traefik at `emberbox.app`.

## Publishing

Each package is published to npmjs when a tag matching its version is pushed on `main`:

| Package | Tag | Workflow |
|---|---|---|
| `@emberbox/ui` | `ui-vX.Y.Z` | `publish-ui.yml` |
| `@emberbox/lint` | `lint-vX.Y.Z` | `publish-lint.yml` |

npm trusts these workflows as publishers (trusted publishing), so no token is needed. Trusted
publishing can only be set up for a package that already exists, so `publish-lint.yml` uses the
repository secret `NPM_TOKEN` while it is set; delete the secret once trusted publishing is set up
for `@emberbox/lint`.

The logo pictograms come from [Lucide](https://lucide.dev) (ISC); `./toolchain.sh ui-logos`
regenerates them.

## License

MIT
