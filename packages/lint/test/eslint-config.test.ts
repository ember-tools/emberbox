import {mkdirSync, mkdtempSync, writeFileSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {ESLint} from 'eslint'
import {describe, expect, it} from 'vitest'
import {emberboxEslint} from '../src/eslint.mjs'

/**
 * The config the factory builds, applied to a small project written to a temporary folder.
 *
 * @vitest-environment node
 */
const root = mkdtempSync(join(tmpdir(), 'emberbox-eslint-'))
mkdirSync(join(root, 'src', 'model'), {recursive: true})
mkdirSync(join(root, 'src', 'views'), {recursive: true})

/**
 * The rule ids ESLint reports for one file of the temporary project.
 *
 * @param options the factory's options
 * @param file the file's path below the project
 * @param code its source
 * @returns the rule ids, sorted
 */
async function reported(options: Parameters<typeof emberboxEslint>[0], file: string, code: string): Promise<string[]> {
    writeFileSync(join(root, file), code)
    const eslint = new ESLint({cwd: root, overrideConfigFile: true, overrideConfig: await emberboxEslint(options)})
    const [result] = await eslint.lintFiles([file])
    return result!.messages.map(message => message.ruleId ?? 'fatal').sort()
}

describe('emberboxEslint', () => {
    it('has no i18n rules without a catalogue', async () => {
        const config = await emberboxEslint()
        expect(config.some(entry => entry.name === 'emberbox/locales')).toBe(false)
        expect(config.some(entry => entry.name === 'emberbox/source-size')).toBe(true)
    })

    it('holds components to the Emberbox conventions', async () => {
        const code = '<script setup lang="ts">\nconsole.log(1)\n</script>\n\n<template>\n  <div v-html="x"></div>\n</template>\n'
        const rules = await reported({}, 'src/views/Page.vue', code)
        expect(rules).toEqual(expect.arrayContaining(['no-restricted-properties', 'vue/html-self-closing', 'vue/no-v-html']))
    })

    it('sends every text of a template through the catalogue when there is one', async () => {
        mkdirSync(join(root, 'src', 'i18n'), {recursive: true})
        writeFileSync(join(root, 'src/i18n/de.ts'), "export default {start: {title: 'Start'}}\n")
        const code = '<script setup lang="ts">\nimport {useI18n} from \'vue-i18n\'\n\nconst {t} = useI18n()\n</script>\n\n<template>\n  <h1>{{ t(\'start.title\') }}</h1>\n  <p>Hallo Welt</p>\n</template>\n'
        const rules = await reported({cwd: root, catalogue: 'src/i18n/de.ts'}, 'src/views/Start.vue', code)
        expect(rules).toEqual(['@intlify/vue-i18n/no-raw-text'])
    })

    it('leaves undefined names in TypeScript to the type checker, which knows the auto-imports', async () => {
        const code = '<script setup lang="ts">\nconst toast = useToast()\ntoast.add({title: \'x\'})\n</script>\n'
        expect(await reported({}, 'src/views/Toast.vue', code)).not.toContain('no-undef')
        expect(await reported({}, 'src/plain.mjs', 'export const toast = useToast()\n')).toContain('no-undef')
    })

    it('enforces the import boundaries between layers', async () => {
        writeFileSync(join(root, 'src/views/helper.ts'), 'export const helper = 1\n')
        const code = "import {helper} from '../views/helper'\n\nexport const model = helper\n"
        const rules = await reported({cwd: root, layers: [{layer: 'model', above: ['views']}]}, 'src/model/state.ts', code)
        expect(rules).toContain('import-x/no-restricted-paths')
    })

    it('checks the catalogue for unused keys and plurals, and the views for missing keys', async () => {
        mkdirSync(join(root, 'src', 'i18n'), {recursive: true})
        writeFileSync(join(root, 'src/i18n/de.ts'), "export default {start: {title: 'Start', unused: 'weg', count: 'ein | zwei'}}\n")
        writeFileSync(join(root, 'src/views/Used.vue'), "<script setup lang=\"ts\">\nimport {useI18n} from 'vue-i18n'\n\nconst {t} = useI18n()\n</script>\n\n<template>\n  <h1>{{ t('start.title') }}</h1>\n  <p>{{ t('start.count') }}</p>\n</template>\n")
        const options = {cwd: root, catalogue: 'src/i18n/de.ts'}
        const catalogue = await reported(options, 'src/i18n/de.ts', "export default {start: {title: 'Start', unused: 'weg', count: 'ein | zwei'}}\n")
        expect(catalogue).toEqual(['emberbox/i18n-no-plural-messages', 'emberbox/i18n-unused-keys'])
        const view = "<script setup lang=\"ts\">\nimport {useI18n} from 'vue-i18n'\n\nconst {t} = useI18n()\n</script>\n\n<template>\n  <h1>{{ t('start.nope') }}</h1>\n</template>\n"
        expect(await reported(options, 'src/views/Missing.vue', view)).toEqual(['@intlify/vue-i18n/no-missing-keys'])
    })

    it('allows plural messages only when asked to', async () => {
        const catalogue = "export default {list: {count: '{n} Alarm | {n} Alarme'}}\n"
        const strict = await reported({cwd: root, catalogue: 'src/i18n/plurals.ts'}, 'src/i18n/plurals.ts', catalogue)
        expect(strict).toContain('emberbox/i18n-no-plural-messages')
        const relaxed = await reported({cwd: root, catalogue: 'src/i18n/plurals.ts', plurals: true}, 'src/i18n/plurals.ts', catalogue)
        expect(relaxed).not.toContain('emberbox/i18n-no-plural-messages')
    })

    it('counts repeated class patterns in the configured source directory, outside its components', async () => {
        mkdirSync(join(root, 'app', 'views'), {recursive: true})
        mkdirSync(join(root, 'app', 'components'), {recursive: true})
        const pattern = '<p class="py-4 text-(--text-muted) text-center text-sm">x</p>'
        const template = `<template>\n  <div>\n${`    ${pattern}\n`.repeat(10)}  </div>\n</template>\n`
        const options = {cwd: root, src: 'app'}
        expect(await reported(options, 'app/views/Page.vue', template)).toContain('emberbox/repeated-class-pattern')
        expect(await reported(options, 'app/components/Part.vue', template)).not.toContain('emberbox/repeated-class-pattern')
    })
})
