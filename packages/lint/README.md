# @emberbox/lint

The shared linters of the [Emberbox](https://emberbox.app) tools: an ESLint flat config with the
Emberbox rules, and `emberbox-lint`, which runs ESLint together with the linters ESLint does not
cover.

```sh
npm install --save-dev @emberbox/lint eslint
```

## ESLint

```js
// eslint.config.mjs
import {emberboxEslint} from '@emberbox/lint'

export default await emberboxEslint({
    catalogue: 'src/i18n/de.ts',
    layers: [{layer: 'model', above: ['views', 'components']}],
})
```

The config brings Vue, TypeScript and accessibility as recommended and the Emberbox conventions:
script, template and style in that order, self-closing empty elements, no `v-html`, no leftover
`console.log`, named state types, functions of at most 79 lines, and for templates outside
`components/` no class pattern repeated across the views and no oversized template blocks. Undefined
names in TypeScript and Vue files are left to the type checker (`vue-tsc` or `tsc`), which knows
auto-imported names such as Nuxt UI's composables; run it alongside, since ESLint does not report
them there. JavaScript files are still checked by `no-undef`.

| Option | Default | Meaning |
|---|---|---|
| `src` | `src` | the source directory |
| `catalogue` | none | the German vue-i18n catalogue; with it every template text goes through the catalogue, and the catalogue is checked for missing, unused and plural messages |
| `layers` | `[]` | which source directories may not import from which |
| `maxFunctionLines` | `79` | the longest function allowed |
| `ignores`, `nodeFiles` | `[]` | further files to skip, or that run in Node |
| `cwd` | working directory | where ESLint runs |

The rules alone are available as the plugin `@emberbox/lint/plugin`, prefix `emberbox`.

## emberbox-lint

`emberbox-lint` reads `emberbox-lint.config.mjs` in the working directory (the frontend, where
ESLint runs) and runs ESLint, jscpd, the browser storage check, the em dash check and the comment
check. It fails when any of them fails, after all have run. `emberbox-lint <name>` runs one of
them, `emberbox-lint --audit` runs all without failing.

```js
// emberbox-lint.config.mjs
export default {
    root: '..',
    sources: [
        {path: 'frontend/src', extensions: ['.ts', '.vue']},
        {path: 'backend/src', extensions: ['.py']},
    ],
    text: [{path: 'README.md', extensions: null}],
    browserStorage: {catalogue: 'frontend/browser-storage.json', sources: 'frontend/src'},
    duplication: '.jscpd.json',
}
```

- `root`: the repository root, relative to the working directory. Every path except `duplication`
  is relative to it.
- `sources`: what the comment and the em dash check read. Only doc comments and one-line `TODO`s are
  allowed, in TypeScript, Vue, JavaScript and Python.
- `text`: further files only the em dash check reads.
- `browserStorage`: a catalogue of every `localStorage` and `sessionStorage` key with its purpose;
  every key the code uses must be declared, every declared key used.
- `duplication`: a jscpd config file, relative to the working directory.

## License

MIT
