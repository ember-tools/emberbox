declare const __EMBERBOX_COMMIT__: string | undefined
declare const __EMBERBOX_BUILT_AT__: string | undefined

/**
 * The build the tool runs in. `emberbox()` sets both at build time: the short commit and the build
 * time as an ISO timestamp. Without `emberbox()`, for example in a test run, the commit is `dev`
 * and the build time stays empty.
 */
export const buildInfo = {
    commit: typeof __EMBERBOX_COMMIT__ === 'string' ? __EMBERBOX_COMMIT__ : 'dev',
    builtAt: typeof __EMBERBOX_BUILT_AT__ === 'string' ? __EMBERBOX_BUILT_AT__ : '',
}

/**
 * The build time in the reader's time zone, or empty when it is missing. It depends on the reader
 * and therefore belongs on the page only after mounting, never in prerendered HTML.
 */
export function formatBuiltAt(): string {
    const time = new Date(buildInfo.builtAt)
    return Number.isNaN(time.getTime())
        ? ''
        : time.toLocaleString('de-DE', {dateStyle: 'medium', timeStyle: 'short'})
}
