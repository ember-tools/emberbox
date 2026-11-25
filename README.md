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
/* stil.css */
@import "tailwindcss";
@import "@nuxt/ui";
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

Primäre Knöpfe sind tintenschwarz, Rot gibt es als Farbe `signal` und für Fehler (`error`).
Icons kommen aus Lucide (`i-lucide-*`) und werden beim Bauen gebündelt.

Zum lokalen Ausprobieren in einem Werkzeug wird die Lib als Paket gepackt, damit ihre
Abhängigkeiten im Werkzeug landen:

```sh
./toolchain.sh ui-build
npm pack -w @emberbox/ui            # erzeugt emberbox-ui-<version>.tgz
cd ../werkzeug/frontend && npm install ../../emberbox/emberbox-ui-<version>.tgz
```

## Lizenz

MIT
