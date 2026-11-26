import {mkdirSync, mkdtempSync, rmSync, writeFileSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {RuleTester} from 'eslint'
import {afterAll, describe, expect, it} from 'vitest'
import * as localeParser from '../src/i18n/locale-parser.mjs'
import rule from '../src/i18n/unused-keys.mjs'

/**
 * The catalogue rule against a small source tree written to a temporary folder.
 *
 * @vitest-environment node
 */
const root = mkdtempSync(join(tmpdir(), 'emberbox-i18n-'))
mkdirSync(join(root, 'src', 'i18n'), {recursive: true})
writeFileSync(join(root, 'src', 'Ansicht.vue'), "<template><p>{{ t('app.name') }}</p></template>")
writeFileSync(join(root, 'src', 'phase.ts'), "export const titel = (id: string) => t(`phase.${id}.titel`)\nexport const alle = () => tm('app.liste')")
const catalogue = join(root, 'src', 'i18n', 'de.ts')
writeFileSync(catalogue, "export default {nur: {hier: 'zählt nicht'}}")

afterAll(() => rmSync(root, {recursive: true, force: true}))

const tester = new RuleTester({languageOptions: {parser: localeParser}})
const options = [{sources: join(root, 'src'), german: [{file: catalogue}]}]

tester.run('i18n-unused-keys', rule, {
    valid: [
        {
            name: 'keys used directly, through a template literal and through tm()',
            code: "export default {app: {name: 'Calltaker', liste: {a: 'x', b: 'y'}}, phase: {standort: {titel: 'Standort'}}}",
            filename: catalogue,
            options,
        },
    ],
    invalid: [
        {
            name: 'a key nothing uses',
            code: "export default {app: {name: 'Calltaker', alt: 'x'}}",
            filename: catalogue,
            options,
            errors: [{messageId: 'unused', data: {key: 'app.alt'}}],
        },
        {
            name: 'the catalogue itself does not count as a use',
            code: "export default {nur: {hier: 'zählt nicht'}}",
            filename: catalogue,
            options,
            errors: [{messageId: 'unused', data: {key: 'nur.hier'}}],
        },
        {
            name: 'with enableFix the whole line goes',
            code: "export default {\n    app: {name: 'Calltaker'},\n    weg: 'x',\n}",
            output: "export default {\n    app: {name: 'Calltaker'},\n}",
            filename: catalogue,
            options: [{...options[0], enableFix: true}],
            errors: [{messageId: 'unused', data: {key: 'weg'}}],
        },
    ],
})

describe('the locale parser', () => {
    it('reads the default export as the message tree', () => {
        const {ast} = localeParser.parseForESLint("const A = 'a'\nexport default {x: {y: A + 'b'}, z: `c`}")
        expect(localeParser.messagesOf(ast)).toEqual({x: {y: 'ab'}, z: 'c'})
    })
})
