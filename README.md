# Emberbox

Werkzeuge für Ausbildung und Übung in der Feuerwehr, unter einem Dach auf
[emberbox.app](https://emberbox.app).

Dieses Repository enthält:

- **`packages/ui`** – `@emberbox/ui`, der gemeinsame Stil der Emberbox-Werkzeuge. Baut auf
  [Nuxt UI](https://ui.nuxt.com) auf und bringt dessen Komponenten im Emberbox-Stil mit.
- **`hub`** – die Startseite emberbox.app.

## Entwicklung

Voraussetzung ist [Nix](https://nixos.org) mit direnv; `shell.nix` liefert Node.

```sh
./toolchain.sh install
./toolchain.sh hub-dev      # Musterseite unter http://localhost:5173/muster
./toolchain.sh verify       # alles, was die CI prüft
```

## `@emberbox/ui` in einem Werkzeug

```ts
// vite.config.ts – ersetzt @tailwindcss/vite
import vue from '@vitejs/plugin-vue'
import {emberbox} from '@emberbox/ui/vite'
import {defineConfig} from 'vite'

export default defineConfig({plugins: [vue(), emberbox()]})
```

```css
/* stil.css – bringt Tailwind und Nuxt UI mit */
@import "@emberbox/ui/stil.css";
```

```ts
// main.ts
import {emberboxUi} from '@emberbox/ui'

createApp(App).use(router).use(emberboxUi).mount('#app')
```

```vue
<!-- App.vue -->
<script setup lang="ts">
import {AppFuss, AppKopf, EmberboxApp} from '@emberbox/ui'
</script>

<template>
  <EmberboxApp>
    <AppKopf name="Calltaker" untertitel="Notrufabfrage üben"/>
    <RouterView/>
    <AppFuss werkzeug="Calltaker" quelle="https://github.com/rainbowdashlabs/calltaker"
             lizenz="AGPL-3.0" hilfe="/hilfe"/>
  </EmberboxApp>
</template>
```

`EmberboxApp` stellt Nuxt UI auf Deutsch und zeigt ein Band, sobald ein neuerer Build ausgeliefert
wird. Werkzeuge ohne vue-router nutzen `emberbox({router: false})`.

Commit und Bauzeit stehen als `fassung` aus `@emberbox/ui` bereit und erscheinen im Fuß.
`emberbox()` liest sie aus `git` oder, im Image-Build ohne `.git`, aus den Umgebungsvariablen
`COMMIT` und `GEBAUT`:

```dockerfile
ARG COMMIT=dev
ARG GEBAUT
RUN COMMIT=$COMMIT GEBAUT=$GEBAUT npm run build
```

Neben jedem Build liegt `fassung.json`. Das Backend liefert sie im Wurzelverzeichnis aus, ohne
Caching (`Cache-Control: no-store`), damit offene Seiten einen neuen Build bemerken.

Weitere Bausteine: `CodeAnzeige`, `useRueckfrage`, `usePolling` und die Hilfe-Komponenten
`HilfeSeite`, `HilfeAbschnitt`, `HilfeThema`, `HilfeMockup`. Die Musterseite zeigt sie alle.

## Logo, SEO und Vorrendern

```ts
// vite.config.ts
emberbox({
    adresse: 'https://calltaker.emberbox.app',
    logo: 'calltaker',
    vorrendern: {eintrag: 'src/vorrendern.ts', pfade: ['/', '/hilfe']},
})
```

- `logo` legt `favicon.svg`, `apple-touch-icon.png` und `logo-512.png` ins Wurzelverzeichnis und
  verlinkt sie. `AppKopf` zeigt es mit `logo="/favicon.svg"`.
- `useSeite({titel, beschreibung, pfad, indexieren, bild, daten})` setzt Titel, Beschreibung,
  canonical, OpenGraph und `robots` einer Seite; `werkzeugDaten(...)` liefert JSON-LD dazu.
- `vorrendern` rendert die öffentlichen Seiten beim Bauen nach `dist/seiten/<pfad>/index.html`
  und schreibt `sitemap.xml` und `robots.txt`. `dist/index.html` bleibt die leere Hülle für alle
  übrigen Routen. Das Backend liefert für `/` `seiten/index.html` aus, für `/hilfe`
  `seiten/hilfe/index.html`, sonst `index.html`.

```ts
// src/vorrendern.ts
import {seiteRendern} from '@emberbox/ui/vorrendern'

export async function render(pfad: string, vorlage: string): Promise<string> {
    const router = routerErzeugen(createMemoryHistory())
    const app = createSSRApp(App).use(router)
    await router.push(pfad)
    await router.isReady()
    return seiteRendern(app, vorlage)
}
```

Im Browser erzeugt `appErzeugen(App)` die App so, dass sie vorgerendertes HTML übernimmt; vor
`mount` wartet sie auf `router.isReady()`. Die vorgerenderten Seiten dürfen beim Aufbau nicht auf
`window` oder `document` zugreifen, nur in `onMounted`. Ein vollständiges Beispiel liegt in
`probe/`.

Primäre Knöpfe sind tintenschwarz, Rot gibt es als Farbe `signal` und für Fehler (`error`).
Icons kommen aus Lucide (`i-lucide-*`) und werden beim Bauen gebündelt.

Zum lokalen Ausprobieren in einem Werkzeug wird die Lib als Paket gepackt, damit ihre
Abhängigkeiten im Werkzeug landen:

```sh
./toolchain.sh ui-build
npm pack -w @emberbox/ui            # erzeugt emberbox-ui-<version>.tgz
cd ../werkzeug/frontend && npm install ../../emberbox/emberbox-ui-<version>.tgz
```

## Veröffentlichen

`@emberbox/ui` erscheint auf npmjs, sobald ein Tag `ui-vX.Y.Z` auf `main` gepusht wird, das zur
Version in `packages/ui/package.json` passt. Der Workflow braucht das Secret `NPM_TOKEN`.

Die Piktogramme der Logos stammen aus [Lucide](https://lucide.dev) (ISC);
`./toolchain.sh ui-logos` erzeugt sie neu.

## Lizenz

MIT
