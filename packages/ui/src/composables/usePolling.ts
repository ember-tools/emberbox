import {onBeforeUnmount, onMounted, ref} from 'vue'

/** Wie ein Werkzeug den Server abfragt. */
export interface PollingOptionen {
    /** Abstand zwischen zwei Abfragen, solange der Server antwortet. */
    intervallMs?: number
    /** Längster Abstand, auf den das Warten nach Fehlern anwächst. */
    hoechstensMs?: number
}

/**
 * Fragt regelmäßig ab, solange die Seite sichtbar ist. Scheitert eine Abfrage, verdoppelt sich der
 * Abstand bis `hoechstensMs`, damit ein ausgefallener Server nicht im Sekundentakt angefragt wird;
 * die erste gelungene Abfrage setzt ihn zurück. Ein verdeckter Tab fragt nicht, und beim
 * Zurückkehren wird sofort abgefragt.
 *
 * Es läuft nie mehr als eine Abfrage zugleich, damit eine spät eintreffende ältere Antwort keine
 * neuere überschreibt. Wird während einer laufenden Abfrage erneut angestoßen, folgt genau eine
 * weitere, sobald sie fertig ist.
 *
 * @param abfrage holt den Stand; ein Fehler gilt als verlorene Verbindung
 * @returns ob die letzte Abfrage gelang, und `jetzt`, das sofort neu abfragt
 */
export function usePolling(abfrage: () => Promise<unknown>, optionen: PollingOptionen = {}) {
    const intervallMs = optionen.intervallMs ?? 2_000
    const hoechstensMs = optionen.hoechstensMs ?? 30_000
    const verbunden = ref(false)
    let abstand = intervallMs
    let zeitgeber: ReturnType<typeof setTimeout> | undefined
    let aktiv = false
    let laeuft = false
    let nochmal = false

    function planen(): void {
        clearTimeout(zeitgeber)
        if (aktiv && document.visibilityState === 'visible') {
            zeitgeber = setTimeout(() => void runde(), abstand)
        }
    }

    async function runde(): Promise<void> {
        if (laeuft) {
            nochmal = true
            return
        }
        laeuft = true
        clearTimeout(zeitgeber)
        try {
            await abfrage()
            verbunden.value = true
            abstand = intervallMs
        } catch {
            verbunden.value = false
            abstand = Math.min(abstand * 2, hoechstensMs)
        } finally {
            laeuft = false
        }
        if (nochmal && aktiv) {
            nochmal = false
            void runde()
            return
        }
        planen()
    }

    function sichtbar(): void {
        if (document.visibilityState === 'visible') {
            void runde()
        } else {
            clearTimeout(zeitgeber)
        }
    }

    function jetzt(): void {
        abstand = intervallMs
        void runde()
    }

    onMounted(() => {
        aktiv = true
        document.addEventListener('visibilitychange', sichtbar)
        void runde()
    })

    onBeforeUnmount(() => {
        aktiv = false
        nochmal = false
        clearTimeout(zeitgeber)
        document.removeEventListener('visibilitychange', sichtbar)
    })

    return {verbunden, jetzt}
}
