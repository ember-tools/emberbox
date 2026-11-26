import noPluralMessages from './i18n/no-plural-messages.mjs'
import unusedKeys from './i18n/unused-keys.mjs'
import maxFunctionLines from './rules/max-function-lines.mjs'
import repeatedClassPattern from './rules/repeated-class-pattern.mjs'
import templateBlockSize from './rules/template-block-size.mjs'

/**
 * The rules the Emberbox projects hold their frontends to that no published plugin knows about,
 * registered under the `emberbox` prefix.
 */
export default {
    meta: {name: 'emberbox'},
    rules: {
        'i18n-no-plural-messages': noPluralMessages,
        'i18n-unused-keys': unusedKeys,
        'max-function-lines': maxFunctionLines,
        'repeated-class-pattern': repeatedClassPattern,
        'template-block-size': templateBlockSize,
    },
}
