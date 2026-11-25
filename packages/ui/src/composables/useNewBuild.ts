import {onBeforeUnmount, onMounted, ref} from 'vue'
import {buildInfo} from '../build-info'

/** How often an open page asks which build the server serves. */
export const CHECK_INTERVAL_MS = 60_000

/**
 * Whether the server serves a newer build than the one this page runs. The page asks for the
 * `build.json` that `emberbox()` puts next to every build, now and then and whenever it comes back
 * into view. A page left open across a deployment would otherwise keep running the old frontend
 * against the new server.
 */
export function useNewBuild() {
    const newer = ref(false)
    let timer: ReturnType<typeof setInterval> | undefined

    async function check(): Promise<void> {
        if (newer.value) return
        try {
            const response = await fetch('/build.json', {cache: 'no-store'})
            if (!response.ok) return
            const {builtAt} = await response.json() as {builtAt?: string}
            newer.value = Boolean(builtAt) && builtAt !== buildInfo.builtAt
        } catch {
            newer.value = false
        }
    }

    function onVisibilityChange(): void {
        if (document.visibilityState === 'visible') void check()
    }

    onMounted(() => {
        timer = setInterval(() => void check(), CHECK_INTERVAL_MS)
        document.addEventListener('visibilitychange', onVisibilityChange)
        void check()
    })

    onBeforeUnmount(() => {
        clearInterval(timer)
        document.removeEventListener('visibilitychange', onVisibilityChange)
    })

    return newer
}
