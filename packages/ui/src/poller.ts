import {readonly, ref, type Ref} from 'vue'

/** How a tool polls the server. */
export interface PollingOptions {
    /** Delay between two requests while the server answers. */
    intervalMs?: number
    /** Longest delay the wait grows to after failures. */
    maxIntervalMs?: number
    /**
     * Delay between two requests while the tab is hidden. Without it a hidden tab does not poll at
     * all; with it the tab keeps polling at this slower pace, for state that must stay alive in the
     * background, such as a heartbeat.
     */
    hiddenIntervalMs?: number
}

/** A running poll loop, controlled without a component. */
export interface Poller {
    /** Whether the last request succeeded. */
    connected: Readonly<Ref<boolean>>
    /** Polls at once and then on schedule, and follows the tab's visibility. */
    start(): void
    /** Ends polling until the next `start`; a request already running still completes, a queued one is dropped. */
    stop(): void
    /**
     * Polls at once and resolves once a request started after this call has completed. On a stopped
     * poller it still fetches once if no request is running, without scheduling more.
     */
    refresh(): Promise<void>
}

/**
 * Whether the page is hidden; outside a browser, while prerendering, it counts as visible.
 *
 * @returns true for a hidden tab
 */
function pageHidden(): boolean {
    return typeof document !== 'undefined' && document.visibilityState === 'hidden'
}

/**
 * Creates a poll loop. When a request fails, the delay doubles up to `maxIntervalMs`, so a server
 * that is down is not hit every second; the first successful request resets it. A hidden tab
 * pauses, or polls every `hiddenIntervalMs` when that is set; coming back polls at once.
 *
 * Never more than one request runs at a time, so a late older answer cannot overwrite a newer one.
 * A trigger during a running request queues exactly one more request after it. The request may call
 * `stop` itself, for example when the server says the thing polled for no longer exists.
 *
 * @param request fetches the state; an error counts as a lost connection
 * @param options the delays
 * @returns the poller, not yet started
 */
export function createPoller(request: () => Promise<unknown>, options: PollingOptions = {}): Poller {
    const intervalMs = options.intervalMs ?? 2_000
    const maxIntervalMs = options.maxIntervalMs ?? 30_000
    const hiddenIntervalMs = options.hiddenIntervalMs
    const connected = ref(false)
    let delay = intervalMs
    let timer: ReturnType<typeof setTimeout> | undefined
    let active = false
    let running: Promise<void> | null = null
    let queued: Promise<void> | null = null

    function schedule(): void {
        clearTimeout(timer)
        if (!active) return
        if (!pageHidden()) {
            timer = setTimeout(() => void poll(), delay)
        } else if (hiddenIntervalMs !== undefined) {
            timer = setTimeout(() => void poll(), Math.max(delay, hiddenIntervalMs))
        }
    }

    async function once(): Promise<void> {
        clearTimeout(timer)
        try {
            await request()
            connected.value = true
            delay = intervalMs
        } catch {
            connected.value = false
            delay = Math.min(delay * 2, maxIntervalMs)
        }
    }

    function poll(): Promise<void> {
        if (running) {
            queued ??= running.then(() => {
                queued = null
                return active ? poll() : undefined
            })
            return queued
        }
        running = once().finally(() => {
            running = null
            schedule()
        })
        return running
    }

    function onVisibilityChange(): void {
        if (pageHidden()) schedule()
        else void poll()
    }

    return {
        connected: readonly(connected),
        start() {
            if (active) return
            active = true
            if (typeof document !== 'undefined') document.addEventListener('visibilitychange', onVisibilityChange)
            void poll()
        },
        stop() {
            active = false
            clearTimeout(timer)
            if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', onVisibilityChange)
        },
        refresh() {
            delay = intervalMs
            return poll()
        },
    }
}
