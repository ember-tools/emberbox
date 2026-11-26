/** What the script linters read in the library: its sources, scripts and configs. */
export default {
    duplication: '.jscpd.json',
    root: '.',
    sources: [
        {path: 'src', extensions: ['.ts', '.vue', '.mjs']},
        {path: 'scripts', extensions: ['.mjs']},
        {path: 'eslint.config.mjs', extensions: null},
        {path: 'emberbox-lint.config.mjs', extensions: null},
    ],
    text: [
        {path: 'src', extensions: ['.css']},
        {path: 'README.md', extensions: null},
    ],
}
