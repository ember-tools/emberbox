/** What the probe's script linters read: its sources and configs. */
export default {
    sources: [
        {path: 'src', extensions: ['.ts', '.vue']},
        {path: 'eslint.config.mjs', extensions: null},
        {path: 'emberbox-lint.config.mjs', extensions: null},
    ],
    browserStorage: {catalogue: 'browser-storage.json', sources: 'src'},
    duplication: '.jscpd.json',
}
