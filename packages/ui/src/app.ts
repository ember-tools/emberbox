import {type Component, createApp, createSSRApp} from 'vue'

/**
 * Erzeugt die App eines Werkzeugs im Browser. Ist die Seite vorgerendert, übernimmt Vue das
 * vorhandene HTML (Hydration), sonst baut es die Seite neu auf. Vor `mount` muss der Router bereit
 * sein (`await router.isReady()`), damit die Hydration dieselbe Seite trifft.
 */
export function appErzeugen(wurzel: Component) {
    const vorgerendert = (document.getElementById('app')?.childElementCount ?? 0) > 0
    return vorgerendert ? createSSRApp(wurzel) : createApp(wurzel)
}
