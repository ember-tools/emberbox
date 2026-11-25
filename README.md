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

Die App liegt in `<UApp>`. Werkzeuge ohne vue-router nutzen `emberbox({router: false})`.

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
