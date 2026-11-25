declare const __EMBERBOX_COMMIT__: string | undefined
declare const __EMBERBOX_GEBAUT__: string | undefined

/**
 * Der Build, in dem das Werkzeug läuft. `emberbox()` setzt beides beim Bauen: den kurzen Commit
 * und die Bauzeit als ISO-Zeitpunkt. Ohne `emberbox()`, etwa in einem Testlauf, heißt der Commit
 * `dev` und die Bauzeit bleibt leer.
 */
export const fassung = {
    commit: typeof __EMBERBOX_COMMIT__ === 'string' ? __EMBERBOX_COMMIT__ : 'dev',
    gebaut: typeof __EMBERBOX_GEBAUT__ === 'string' ? __EMBERBOX_GEBAUT__ : '',
}

/**
 * Die Bauzeit in der Zeitzone des Lesers, oder leer, wenn sie fehlt. Hängt vom Leser ab und gehört
 * deshalb erst nach dem Einhängen ins Bild, nie ins vorgerenderte HTML.
 */
export function gebautLesbar(): string {
    const zeitpunkt = new Date(fassung.gebaut)
    return Number.isNaN(zeitpunkt.getTime())
        ? ''
        : zeitpunkt.toLocaleString('de-DE', {dateStyle: 'medium', timeStyle: 'short'})
}
