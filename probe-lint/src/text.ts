import de from './i18n/de'

/**
 * Looks a text up by its dotted key, as vue-i18n's `t` would; the probe needs no Vue runtime.
 *
 * @param key the dotted key
 * @returns the text, or the key when there is none
 */
export function t(key: string): string {
    const found = key.split('.').reduce<unknown>((node, part) => (node as Record<string, unknown> | undefined)?.[part], de)
    return typeof found === 'string' ? found : key
}
