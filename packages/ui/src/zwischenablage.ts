/**
 * Legt Text in die Zwischenablage. Über eine unverschlüsselte Adresse, etwa ein Werkzeug im
 * lokalen Netz, gibt es die Clipboard-API nicht; dann hilft eine kurz eingefügte Textauswahl.
 *
 * @returns ob der Text wirklich in der Zwischenablage liegt
 */
export async function inZwischenablage(text: string): Promise<boolean> {
    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text)
            return true
        }
    } catch {
        return altKopieren(text)
    }
    return altKopieren(text)
}

function altKopieren(text: string): boolean {
    const feld = document.createElement('textarea')
    feld.value = text
    feld.setAttribute('readonly', '')
    feld.style.position = 'fixed'
    feld.style.opacity = '0'
    document.body.appendChild(feld)
    feld.select()
    try {
        return document.execCommand('copy')
    } catch {
        return false
    } finally {
        feld.remove()
    }
}
