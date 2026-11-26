/**
 * What the script linters read for the hub, which also stands for the repository's own files: the
 * hub's sources and configs, the toolchain, the workflows and the README.
 */
export default {
    duplication: '.jscpd.json',
    root: '..',
    sources: [
        {path: 'hub/src', extensions: ['.ts', '.vue']},
        {path: 'hub/vite.config.ts', extensions: null},
        {path: 'hub/eslint.config.mjs', extensions: null},
        {path: 'hub/emberbox-lint.config.mjs', extensions: null},
        {path: 'probe', extensions: ['.ts', '.vue', '.mjs']},
    ],
    text: [
        {path: 'hub/index.html', extensions: null},
        {path: 'hub/Caddyfile', extensions: null},
        {path: 'hub/Dockerfile', extensions: null},
        {path: 'hub/compose.yml', extensions: null},
        {path: 'shell.nix', extensions: null},
        {path: 'hub/legal.example.json', extensions: null},
        {path: '.github', extensions: ['.yml']},
        {path: 'toolchain.sh', extensions: null},
        {path: 'README.md', extensions: null},
    ],
}
