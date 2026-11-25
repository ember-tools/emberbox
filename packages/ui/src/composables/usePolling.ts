import {onBeforeUnmount, onMounted, ref} from 'vue'

/** How a tool polls the server. */
export interface PollingOptions {
    /** Delay between two requests while the server answers. */
    intervalMs?: number
    /** Longest delay the wait grows to after failures. */
    maxIntervalMs?: number
}

/**
 * Polls regularly while the page is visible. When a request fails, the delay doubles up to
 * `maxIntervalMs`, so a server that is down is not hit every second; the first successful request
 * resets it. A hidden tab does not poll, and coming back polls at once.
 *
 * Never more than one request runs at a time, so a late older answer cannot overwrite a newer one.
 * A trigger during a running request queues exactly one more request after it.
 *
 * @param request fetches the state; an error counts as a lost connection
 * @returns whether the last request succeeded, and `refresh`, which polls immediately
 */
export function usePolling(request: () => Promise<unknown>, options: PollingOptions = {}) {
    const intervalMs = options.intervalMs ?? 2_000
    const maxIntervalMs = options.maxIntervalMs ?? 30_000
    const connected = ref(false)
    let delay = intervalMs
    let timer: ReturnType<typeof setTimeout> | undefined
    let active = false
    let running = false
    let again = false

    function schedule(): void {
        clearTimeout(timer)
        if (active && document.visibilityState === 'visible') {
            timer = setTimeout(() => void poll(), delay)
        }
    }

    async function poll(): Promise<void> {
        if (running) {
            again = true
            return
        }
        running = true
        clearTimeout(timer)
        try {
            await request()
            connected.value = true
            delay = intervalMs
        } catch {
            connected.value = false
            delay = Math.min(delay * 2, maxIntervalMs)
        } finally {
            running = false
        }
        if (again && active) {
            again = false
            void poll()
            return
        }
        schedule()
    }

    function onVisibilityChange(): void {
        if (document.visibilityState === 'visible') {
            void poll()
        } else {
            clearTimeout(timer)
        }
    }

    function refresh(): void {
        delay = intervalMs
        void poll()
    }

    onMounted(() => {
        active = true
        document.addEventListener('visibilitychange', onVisibilityChange)
        void poll()
    })

    onBeforeUnmount(() => {
        active = false
        again = false
        clearTimeout(timer)
        document.removeEventListener('visibilitychange', onVisibilityChange)
    })

    return {connected, refresh}
}
