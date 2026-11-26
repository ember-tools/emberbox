/** Which browser storage entries a tool no longer wants under their current names. */
export interface StorageCleanUp {
    /** Keys to delete; a key ending in `*` deletes every key starting with the part before it. */
    remove?: string[]
    /** Old key to new key: the value moves over unless the new key already holds one. */
    move?: Record<string, string>
}

/**
 * Whether a stored key matches a key or a prefix pattern ending in `*`.
 *
 * @param key the stored key
 * @param pattern a key or a prefix pattern
 * @returns true when it matches
 */
function matches(key: string, pattern: string): boolean {
    return pattern.endsWith('*') ? key.startsWith(pattern.slice(0, -1)) : key === pattern
}

/**
 * Tidies a tool's browser storage at startup: moves values from retired keys to their new names and
 * deletes keys the tool no longer reads. A storage the browser refuses, as in some private modes,
 * is left alone.
 *
 * @param cleanUp what to delete and what to move
 * @param storage the storage to tidy, `localStorage` by default
 */
export function cleanUpStorage(cleanUp: StorageCleanUp, storage?: Storage): void {
    try {
        const target = storage ?? localStorage
        for (const [from, to] of Object.entries(cleanUp.move ?? {})) {
            if (from === to) continue
            const value = target.getItem(from)
            if (value !== null && target.getItem(to) === null) target.setItem(to, value)
            target.removeItem(from)
        }
        const patterns = cleanUp.remove ?? []
        const keys = Array.from({length: target.length}, (_, index) => target.key(index))
        for (const key of keys) {
            if (key !== null && patterns.some(pattern => matches(key, pattern))) target.removeItem(key)
        }
    } catch {
        return
    }
}
