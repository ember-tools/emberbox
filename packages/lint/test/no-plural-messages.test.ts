import rule from '../src/i18n/no-plural-messages.mjs'
import {RuleTester} from 'eslint'
import * as localeParser from '../src/i18n/locale-parser.mjs'

/**
 * A pipe written as text, which vue-i18n reads as the start of a second plural choice.
 *
 * @vitest-environment node
 */
new RuleTester({languageOptions: {parser: localeParser}}).run('i18n-no-plural-messages', rule, {
    valid: [
        {
            name: 'an escaped pipe is text',
            filename: 'src/i18n/de.ts',
            code: "export default {a: {b: 'Ja {\\'|\\'} Nein'}}",
        },
        {
            name: 'a message without a pipe',
            filename: 'src/i18n/de.ts',
            code: "export default {a: 'Ja oder Nein'}",
        },
    ],
    invalid: [
        {
            name: 'a bare pipe splits the message',
            filename: 'src/i18n/de.ts',
            code: "export default {a: {b: 'Ja | Nein'}}",
            errors: [{messageId: 'plural', line: 1}],
        },
        {
            name: 'also when it is concatenated or shared through a constant',
            filename: 'src/i18n/de.ts',
            code: "const SHARED = 'eins | zwei'\nexport default {a: SHARED, b: 'drei ' + '| vier'}",
            errors: [{messageId: 'plural', line: 1}, {messageId: 'plural', line: 2}],
        },
    ],
})
