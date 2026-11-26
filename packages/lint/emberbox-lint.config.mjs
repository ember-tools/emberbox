/** What the script linters read in the lint package itself. */
export default {
    duplication: '.jscpd.json',
    root: '.',
    sources: [
        {path: 'src', extensions: ['.mjs']},
        {path: 'test', extensions: ['.ts']},
        {path: 'eslint.config.mjs', extensions: null},
        {path: 'emberbox-lint.config.mjs', extensions: null},
        {path: 'vitest.config.mjs', extensions: null},
    ],
    text: [{path: 'README.md', extensions: null}],
}
