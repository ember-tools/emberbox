import {onBeforeUnmount, onMounted} from 'vue'
import {createPoller, type PollingOptions} from '../poller'

/**
 * Polls while the component is mounted, with the loop of `createPoller`: backoff after failures,
 * one request at a time, and a hidden tab that pauses or, with `hiddenIntervalMs`, polls slower.
 *
 * @param request fetches the state; an error counts as a lost connection
 * @param options the delays
 * @returns whether the last request succeeded, `refresh`, which polls immediately, and `stop`
 */
export function usePolling(request: () => Promise<unknown>, options: PollingOptions = {}) {
    const poller = createPoller(request, options)
    onMounted(poller.start)
    onBeforeUnmount(poller.stop)
    return {connected: poller.connected, refresh: poller.refresh, stop: poller.stop}
}
