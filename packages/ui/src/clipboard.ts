/**
 * Puts text on the clipboard. On an unencrypted address, such as a tool in the local network, the
 * Clipboard API is missing; a briefly inserted text selection helps then.
 *
 * @returns whether the text really is on the clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text)
            return true
        }
    } catch {
        return legacyCopy(text)
    }
    return legacyCopy(text)
}

function legacyCopy(text: string): boolean {
    const field = document.createElement('textarea')
    field.value = text
    field.setAttribute('readonly', '')
    field.style.position = 'fixed'
    field.style.opacity = '0'
    document.body.appendChild(field)
    field.select()
    try {
        return document.execCommand('copy')
    } catch {
        return false
    } finally {
        field.remove()
    }
}
