import {onBeforeUnmount, onMounted, ref} from 'vue'
import {fassung} from '../fassung'

/** Wie oft eine offene Seite nachfragt, welchen Build der Server ausliefert. */
export const PRUEFEN_ALLE_MS = 60_000

/**
 * Ob der Server einen neueren Build ausliefert als den, in dem diese Seite läuft. Die Seite fragt
 * dazu ab und zu und bei jeder Rückkehr in den Vordergrund die `fassung.json` ab, die `emberbox()`
 * neben jeden Build legt. Eine über ein Deployment offen gebliebene Seite liefe sonst mit dem alten
 * Frontend gegen den neuen Server.
 */
export function useNeueFassung() {
    const neu = ref(false)
    let zeitgeber: ReturnType<typeof setInterval> | undefined

    async function pruefen(): Promise<void> {
        if (neu.value) return
        try {
            const antwort = await fetch('/fassung.json', {cache: 'no-store'})
            if (!antwort.ok) return
            const {gebaut} = await antwort.json() as {gebaut?: string}
            neu.value = Boolean(gebaut) && gebaut !== fassung.gebaut
        } catch {
            neu.value = false
        }
    }

    function sichtbar(): void {
        if (document.visibilityState === 'visible') void pruefen()
    }

    onMounted(() => {
        zeitgeber = setInterval(() => void pruefen(), PRUEFEN_ALLE_MS)
        document.addEventListener('visibilitychange', sichtbar)
        void pruefen()
    })

    onBeforeUnmount(() => {
        clearInterval(zeitgeber)
        document.removeEventListener('visibilitychange', sichtbar)
    })

    return neu
}
