import {useOverlay} from '@nuxt/ui/composables'
import Rueckfrage from '../komponenten/Rueckfrage.vue'

/** Was eine Rückfrage außer der Frage selbst zeigt. */
export interface RueckfrageOptionen {
    /** Ein Satz unter der Frage, etwa was die Handlung auslöst. */
    erklaerung?: string
    /** Die Beschriftung des bestätigenden Knopfs. */
    bestaetigung?: string
    /** Ob die Handlung etwas zerstört; der Knopf erscheint dann in Signalrot. */
    gefahr?: boolean
}

/**
 * Eine Bestätigung im Seiteninneren statt `window.confirm`, das die ganze Seite blockiert und
 * damit auch jede laufende Abfrage anhält. Muss im `setup` einer Komponente unter `EmberboxApp`
 * aufgerufen werden. Jede Rückfrage legt ihr Fenster neu an und räumt es nach dem Schließen weg.
 *
 * @returns eine Funktion, die die Rückfrage öffnet und mit `true` auflöst, wenn bestätigt wurde
 */
export function useRueckfrage() {
    const overlay = useOverlay()
    return async (frage: string, optionen: RueckfrageOptionen = {}): Promise<boolean> => {
        const fenster = overlay.create(Rueckfrage, {destroyOnClose: true})
        return Boolean(await fenster.open({frage, ...optionen}).result)
    }
}
