import {join, resolve} from 'node:path'
import tsParser from '@typescript-eslint/parser'
import {RuleTester} from 'eslint'
import vueParser from 'vue-eslint-parser'

/**
 * A rule tester reading single file components the way the project's ESLint config reads them.
 *
 * @returns the tester
 */
export function vueRuleTester(): RuleTester {
    return new RuleTester({
        languageOptions: {
            parser: vueParser,
            parserOptions: {parser: tsParser, ecmaVersion: 'latest', sourceType: 'module'},
        },
    })
}

/**
 * The absolute path of a file below the default source directory `src` of the working
 * directory, for rules that decide by where a file sits.
 *
 * @param path the path below `src/`
 * @returns the absolute path
 */
export function sourceFile(path: string): string {
    return join(resolve('src'), path)
}
