import js from '@eslint/js'
import vueI18n from '@intlify/eslint-plugin-vue-i18n'
import {createNodeResolver, importX} from 'eslint-plugin-import-x'
import vue from 'eslint-plugin-vue'
import vueA11y from 'eslint-plugin-vuejs-accessibility'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import * as localeParser from './i18n/locale-parser.mjs'
import {localeSnapshots} from './i18n/locales.mjs'
import emberbox from './plugin.mjs'
import {INLINE_STATE_TYPE, restrictSyntax} from './restrictions.mjs'

/**
 * Vue's rules as the Emberbox components are written: script, template, style; an element with
 * nothing inside closes itself; no `v-html`. Layout is left to the author.
 */
const VUE_RULES = {
    'vue/block-order': ['error', {order: ['script', 'template', 'style']}],
    'vue/html-self-closing': ['error', {html: {void: 'always', normal: 'always', component: 'always'}, svg: 'always', math: 'always'}],
    'vue/no-v-html': 'error',
    'vue/multi-word-component-names': 'off',
    'vue/html-indent': 'off',
    'vue/html-closing-bracket-spacing': 'off',
    'vue/html-closing-bracket-newline': 'off',
    'vue/singleline-html-element-content-newline': 'off',
    'vue/multiline-html-element-content-newline': 'off',
    'vue/max-attributes-per-line': 'off',
    'vue/first-attribute-linebreak': 'off',
}

/**
 * Text that reads the same in every language and so needs no catalogue entry: a run without
 * letters, a number with its unit, an upper-case code.
 */
const LANGUAGE_NEUTRAL_TEXT = [
    '[\\p{N}\\p{P}\\p{S}\\s]+',
    '[<>≤≥]?\\s?\\d[\\d.,:]*\\s?(?:ms|s|min|h|m|km|%)?',
    '[A-Z0-9]+(?:[-./][A-Z0-9]+)*\\.?',
]

/** Files that run in Node rather than in the browser: configs, build and lint scripts. */
const NODE_FILES = ['*.config.{ts,mjs,js}', 'scripts/**/*.{mjs,js,ts}', 'tools/**/*.{mjs,js,ts}']

/**
 * The `import-x/no-restricted-paths` zones of one layer.
 *
 * @param src the source directory
 * @param layer the layer and the layers above it, which it may not import from
 * @returns the zones its files are held to
 */
function layerZones(src, {layer, above}) {
    return above.map(from => ({
        target: `./${src}/${layer}`,
        from: `./${src}/${from}`,
        message: `${layer}/ may not import from ${from}/.`,
    }))
}

/**
 * The rules about the catalogue: every key used exists, no text is written into a template
 * instead, the catalogue has no plurals and no key nobody uses.
 *
 * @param src the source directory
 * @param catalogue the catalogue module
 * @param cwd the directory ESLint runs in
 * @returns the config entries
 */
async function i18nConfigs(src, catalogue, cwd) {
    const snapshots = await localeSnapshots(catalogue, cwd)
    const sourceRule = {
        name: 'emberbox/vue-i18n',
        files: [`${src}/**/*.{ts,vue}`],
        ignores: [catalogue, `${src}/**/*.test.ts`],
        plugins: {'@intlify/vue-i18n': vueI18n},
        rules: {'@intlify/vue-i18n/no-missing-keys': 'error'},
    }
    const rawText = {
        name: 'emberbox/raw-text',
        files: [`${src}/**/*.vue`],
        plugins: {'@intlify/vue-i18n': vueI18n},
        rules: {
            '@intlify/vue-i18n/no-raw-text': ['error', {
                ignorePattern: `^(?:${LANGUAGE_NEUTRAL_TEXT.join('|')})$`,
                ignoreNodes: ['code'],
                attributes: {'/.+/': ['aria-label', 'title', 'placeholder', 'alt', 'label']},
            }],
        },
    }
    const locales = {
        name: 'emberbox/locales',
        files: [catalogue],
        languageOptions: {parser: localeParser},
        plugins: {'@intlify/vue-i18n': vueI18n},
        settings: {'vue-i18n': {localeDir: [snapshots, catalogue], messageSyntaxVersion: '^11.0.0'}},
        rules: {
            '@intlify/vue-i18n/valid-message-syntax': 'error',
            'emberbox/i18n-no-plural-messages': 'error',
            'emberbox/i18n-unused-keys': ['error', {sources: src, german: [{file: catalogue}]}],
        },
    }
    return {settings: {'vue-i18n': {localeDir: snapshots, messageSyntaxVersion: '^11.0.0'}}, configs: [sourceRule, rawText, locales]}
}

/**
 * Leaves the catalogue module to the locale rules: the locale parser hands ESLint a JSON AST, which
 * no rule written for a script can read.
 *
 * @param catalogue the catalogue module, if there is one
 * @returns a function adjusting one config entry
 */
function keepOffCatalogue(catalogue) {
    return config => {
        if (!catalogue || config.name === 'emberbox/locales') return config
        if (!config.rules && !config.processor) return config
        return {...config, ignores: [...(config.ignores ?? []), catalogue]}
    }
}

/**
 * The ESLint flat config of an Emberbox frontend.
 *
 * <p>Vue, TypeScript and accessibility as recommended, the Emberbox Vue conventions, no leftover
 * `console.log`, named state types, functions of at most `maxFunctionLines` lines, and for the
 * templates outside `components/` no repeated class patterns and no oversized blocks. With a
 * `catalogue`, every user-visible text goes through vue-i18n and the catalogue is checked; without
 * one the project has no i18n. `layers` names which source directories may not import from which.
 * Paths are relative to the working directory, where ESLint runs.
 *
 * @param {object} [options]
 * @param {string} [options.cwd] the directory ESLint runs in, the working directory by default
 * @param {string} [options.src] the source directory, `src` by default
 * @param {string} [options.catalogue] the German catalogue module, such as `src/i18n/de.ts`
 * @param {{layer: string, above: string[]}[]} [options.layers] import boundaries between source directories
 * @param {number} [options.maxFunctionLines] the longest function allowed, 79 by default
 * @param {string[]} [options.ignores] further files ESLint skips
 * @param {string[]} [options.nodeFiles] further files that run in Node
 * @returns {Promise<import('eslint').Linter.Config[]>} the config
 */
export async function emberboxEslint(options = {}) {
    const {cwd = process.cwd(), src = 'src', catalogue, layers = [], maxFunctionLines = 79, ignores = [], nodeFiles = []} = options
    const i18n = catalogue ? await i18nConfigs(src, catalogue, cwd) : {settings: {}, configs: []}
    return [
        {name: 'emberbox/ignores', ignores: ['node_modules/**', 'dist/**', 'coverage/**', 'public/**', ...ignores]},
        {
            name: 'emberbox/settings',
            settings: {
                'import-x/resolver-next': [createNodeResolver({extensions: ['.ts', '.vue', '.mjs', '.js']})],
                ...i18n.settings,
            },
        },
        {name: 'emberbox/plugin', plugins: {emberbox, 'import-x': importX}},
        js.configs.recommended,
        ...tseslint.configs.recommended,
        ...vue.configs['flat/recommended'],
        {
            name: 'emberbox/vue-parser',
            files: ['**/*.vue'],
            languageOptions: {parserOptions: {parser: tseslint.parser, extraFileExtensions: ['.vue']}},
        },
        {name: 'emberbox/globals', languageOptions: {globals: globals.browser}},
        {name: 'emberbox/node', files: [...NODE_FILES, ...nodeFiles], languageOptions: {globals: {...globals.node}}},
        ...vueA11y.configs['flat/recommended'],
        {
            name: 'emberbox/accessibility',
            files: ['**/*.vue'],
            rules: {'vuejs-accessibility/label-has-for': ['error', {required: {some: ['nesting', 'id']}, allowChildren: true}]},
        },
        {name: 'emberbox/vue', files: ['**/*.vue'], rules: VUE_RULES},
        {
            name: 'emberbox/console',
            files: [`${src}/**/*.{ts,vue}`],
            rules: {
                'no-restricted-properties': ['error',
                    {object: 'console', property: 'log', message: 'Leftover console.log: remove it.'},
                    {object: 'console', property: 'debug', message: 'Leftover console.debug: remove it.'},
                ],
            },
        },
        ...i18n.configs,
        ...layers.map(layer => ({
            name: `emberbox/layers/${layer.layer}`,
            files: [`${src}/${layer.layer}/**/*.{ts,vue}`],
            rules: {'import-x/no-restricted-paths': ['error', {zones: layerZones(src, layer), basePath: cwd}]},
        })),
        {
            name: 'emberbox/source-size',
            files: [`${src}/**/*.{ts,vue}`],
            ignores: [`${src}/**/*.test.ts`, ...(catalogue ? [catalogue] : [])],
            rules: {'emberbox/max-function-lines': ['error', {max: maxFunctionLines}]},
        },
        {name: 'emberbox/state-types', files: [`${src}/**/*.{ts,vue}`], rules: restrictSyntax(INLINE_STATE_TYPE)},
        {
            name: 'emberbox/view-templates',
            files: [`${src}/**/*.vue`],
            ignores: [`${src}/components/**`],
            rules: {
                'emberbox/repeated-class-pattern': ['error', {src}],
                'emberbox/template-block-size': 'error',
            },
        },
        {name: 'emberbox/views', files: [`${src}/views/**/*.vue`, `${src}/pages/**/*.vue`], rules: {'max-lines': ['error', {max: 500}]}},
    ].map(keepOffCatalogue(catalogue))
}
