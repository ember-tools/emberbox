import type {Plugin} from 'vite'

/** A file served at the tool's root: its content and its media type. */
export interface RootFile {
    content: () => string | Uint8Array
    type: string
}

/**
 * A plugin that serves fixed files at the root of a tool, in the dev server as in the client build.
 *
 * @param name the plugin's name
 * @param files the files by their name at the root
 * @returns the plugin, to be extended with further hooks
 */
export function rootFilesPlugin(name: string, files: Record<string, RootFile>): Plugin {
    return {
        name,
        configureServer(server) {
            server.middlewares.use((request, response, next) => {
                const file = files[request.url?.split('?')[0]?.slice(1) ?? '']
                if (!file) return next()
                response.setHeader('Content-Type', file.type)
                response.end(file.content())
            })
        },
        generateBundle() {
            if (this.environment?.config.build.ssr) return
            for (const [fileName, file] of Object.entries(files)) {
                this.emitFile({type: 'asset', fileName, source: file.content()})
            }
        },
    }
}
