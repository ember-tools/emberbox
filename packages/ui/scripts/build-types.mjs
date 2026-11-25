/**
 * Writes `dist/globals.d.ts`: the global types of everything Nuxt UI auto-imports, its components
 * and its composables, for the installed Nuxt UI version. Tools reference it through
 * `"types": ["@emberbox/ui/types"]` in their tsconfig instead of each generating and checking in
 * their own `auto-imports.d.ts` and `components.d.ts`.
 */
import {existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync} from 'node:fs'
import {basename, dirname, join, relative, sep} from 'node:path'
import {fileURLToPath, pathToFileURL} from 'node:url'

const nuxtUiDist = dirname(fileURLToPath(import.meta.resolve('@nuxt/ui')))
const runtime = join(nuxtUiDist, 'runtime')
const target = join(import.meta.dirname, '..', 'dist', 'globals.d.ts')

const unplugin = readFileSync(join(nuxtUiDist, 'unplugin.mjs'), 'utf8')
const chunkImport = /import \{([^}]*)\} from '(\.\/shared\/ui\.[^']+\.mjs)'/.exec(unplugin)
const alias = /\b(\w+) as publicComposables\b/.exec(chunkImport?.[1] ?? '')?.[1]
if (!chunkImport || !alias) throw new Error('Nuxt UI no longer imports its public composables from a shared chunk.')
const publicComposables = (await import(pathToFileURL(join(nuxtUiDist, chunkImport[2])).href))[alias]
const valid = publicComposables && Object.values(publicComposables).every(names =>
    Array.isArray(names) && names.every(name => typeof name === 'string'))
if (!valid || !publicComposables.useToast) throw new Error('Nuxt UI no longer exports its public composables as expected.')

const composables = Object.entries(publicComposables).flatMap(([file, names]) =>
    names.map(name => `  const ${name}: typeof import('@nuxt/ui/composables/${file}')['${name}']`))
const vueComposables = readdirSync(join(runtime, 'vue', 'composables'))
    .filter(file => file.endsWith('.js'))
    .map(file => basename(file, '.js'))
    .map(name => `  const ${name}: typeof import('@nuxt/ui/runtime/vue/composables/${name}.js')['${name}']`)

function vueFiles(directory) {
    return readdirSync(directory, {withFileTypes: true}).flatMap(entry => {
        const path = join(directory, entry.name)
        if (entry.isDirectory()) return ['content', 'prose'].includes(entry.name) ? [] : vueFiles(path)
        return entry.name.endsWith('.vue') ? [path] : []
    })
}

/**
 * Where the component that actually runs in a Vue (non-Nuxt) app lives: Nuxt UI swaps a few for
 * Vue-specific versions, and `Link` for the vue-router one, which also stands in for the plain one.
 */
function vueModeSource(file) {
    if (file === 'Link.vue') return '@nuxt/ui/runtime/vue/overrides/vue-router/Link.vue'
    if (existsSync(join(runtime, 'vue', 'components', file))) return `@nuxt/ui/runtime/vue/components/${file}`
    return `@nuxt/ui/components/${file}`
}

const components = vueFiles(join(runtime, 'components'))
    .map(file => relative(join(runtime, 'components'), file).split(sep).join('/'))
    .sort()
    .map(file => `    U${basename(file, '.vue')}: typeof import('${vueModeSource(file)}')['default']`)

mkdirSync(dirname(target), {recursive: true})
writeFileSync(target, `export {}

declare global {
${[...composables, ...vueComposables].join('\n')}
}

declare module 'vue' {
  export interface GlobalComponents {
${components.join('\n')}
  }
}
`)
console.log(`globals.d.ts: ${composables.length + vueComposables.length} composables, ${components.length} components`)
