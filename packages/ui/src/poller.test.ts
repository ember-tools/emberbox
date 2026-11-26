import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {createPoller} from './poller'

let visibility: DocumentVisibilityState = 'visible'

function setVisibility(state: DocumentVisibilityState): void {
    visibility = state
    document.dispatchEvent(new Event('visibilitychange'))
}

/** Lets pending promise callbacks run without moving the clock. */
async function settle(): Promise<void> {
    await vi.advanceTimersByTimeAsync(0)
}

beforeEach(() => {
    vi.useFakeTimers()
    visibility = 'visible'
    vi.spyOn(document, 'visibilityState', 'get').mockImplementation(() => visibility)
})

afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
})

describe('createPoller', () => {
    it('polls at once on start and then every interval', async () => {
        const request = vi.fn().mockResolvedValue(undefined)
        const poller = createPoller(request, {intervalMs: 1000})
        poller.start()
        await settle()
        expect(request).toHaveBeenCalledTimes(1)
        expect(poller.connected.value).toBe(true)
        await vi.advanceTimersByTimeAsync(1000)
        expect(request).toHaveBeenCalledTimes(2)
        poller.stop()
    })

    it('doubles the wait after failures up to the maximum and resets on success', async () => {
        const request = vi.fn().mockRejectedValue(new Error('down'))
        const poller = createPoller(request, {intervalMs: 1000, maxIntervalMs: 3000})
        poller.start()
        await settle()
        expect(poller.connected.value).toBe(false)
        await vi.advanceTimersByTimeAsync(1999)
        expect(request).toHaveBeenCalledTimes(1)
        await vi.advanceTimersByTimeAsync(1)
        expect(request).toHaveBeenCalledTimes(2)
        await vi.advanceTimersByTimeAsync(3000)
        expect(request).toHaveBeenCalledTimes(3)
        request.mockResolvedValue(undefined)
        await vi.advanceTimersByTimeAsync(3000)
        expect(request).toHaveBeenCalledTimes(4)
        await vi.advanceTimersByTimeAsync(1000)
        expect(request).toHaveBeenCalledTimes(5)
        poller.stop()
    })

    it('pauses a hidden tab without a hidden interval and polls on return', async () => {
        const request = vi.fn().mockResolvedValue(undefined)
        const poller = createPoller(request, {intervalMs: 1000})
        poller.start()
        await settle()
        setVisibility('hidden')
        await vi.advanceTimersByTimeAsync(60_000)
        expect(request).toHaveBeenCalledTimes(1)
        setVisibility('visible')
        await settle()
        expect(request).toHaveBeenCalledTimes(2)
        poller.stop()
    })

    it('keeps polling a hidden tab at the hidden interval', async () => {
        const request = vi.fn().mockResolvedValue(undefined)
        const poller = createPoller(request, {intervalMs: 1000, hiddenIntervalMs: 30_000})
        poller.start()
        await settle()
        setVisibility('hidden')
        await vi.advanceTimersByTimeAsync(29_999)
        expect(request).toHaveBeenCalledTimes(1)
        await vi.advanceTimersByTimeAsync(1)
        expect(request).toHaveBeenCalledTimes(2)
        await vi.advanceTimersByTimeAsync(30_000)
        expect(request).toHaveBeenCalledTimes(3)
        poller.stop()
    })

    it('runs one request at a time and queues exactly one more', async () => {
        let release: () => void = () => undefined
        const request = vi.fn(() => new Promise<void>(resolve => {
            release = resolve
        }))
        const poller = createPoller(request, {intervalMs: 1000})
        poller.start()
        const first = poller.refresh()
        const second = poller.refresh()
        expect(first).toBe(second)
        expect(request).toHaveBeenCalledTimes(1)
        release()
        await settle()
        expect(request).toHaveBeenCalledTimes(2)
        release()
        await first
        expect(request).toHaveBeenCalledTimes(2)
        poller.stop()
    })

    it('resolves refresh only after a request started after the call', async () => {
        const seen: string[] = []
        let state = 'old'
        const poller = createPoller(async () => {
            seen.push(state)
        }, {intervalMs: 1000})
        poller.start()
        state = 'new'
        await poller.refresh()
        expect(seen.at(-1)).toBe('new')
        poller.stop()
    })

    it('stops for good when the request stops it', async () => {
        let calls = 0
        const poller = createPoller(async () => {
            calls++
            poller.stop()
        }, {intervalMs: 1000})
        poller.start()
        await settle()
        await vi.advanceTimersByTimeAsync(10_000)
        setVisibility('hidden')
        setVisibility('visible')
        await settle()
        expect(calls).toBe(1)
    })

    it('drops a queued request when stopped during a request', async () => {
        let calls = 0
        let release: () => void = () => undefined
        const poller = createPoller(() => {
            calls++
            return new Promise<void>(resolve => {
                release = resolve
            })
        }, {intervalMs: 1000})
        poller.start()
        const queued = poller.refresh()
        poller.stop()
        release()
        await queued
        await vi.advanceTimersByTimeAsync(10_000)
        expect(calls).toBe(1)
    })

    it('starts once, and polls again after a restart', async () => {
        const request = vi.fn().mockResolvedValue(undefined)
        const poller = createPoller(request, {intervalMs: 1000})
        poller.start()
        poller.start()
        await settle()
        expect(request).toHaveBeenCalledTimes(1)
        poller.stop()
        await vi.advanceTimersByTimeAsync(5000)
        expect(request).toHaveBeenCalledTimes(1)
        poller.start()
        await settle()
        expect(request).toHaveBeenCalledTimes(2)
        setVisibility('visible')
        await settle()
        expect(request).toHaveBeenCalledTimes(3)
        poller.stop()
    })

    it('keeps the longer backoff in a hidden tab', async () => {
        const request = vi.fn().mockRejectedValue(new Error('down'))
        const poller = createPoller(request, {intervalMs: 1000, maxIntervalMs: 60_000, hiddenIntervalMs: 2000})
        poller.start()
        await settle()
        await vi.advanceTimersByTimeAsync(2000)
        await vi.advanceTimersByTimeAsync(4000)
        expect(request).toHaveBeenCalledTimes(3)
        setVisibility('hidden')
        await vi.advanceTimersByTimeAsync(7999)
        expect(request).toHaveBeenCalledTimes(3)
        await vi.advanceTimersByTimeAsync(1)
        expect(request).toHaveBeenCalledTimes(4)
        poller.stop()
    })

    it('resolves refresh after a failed request too', async () => {
        const poller = createPoller(() => Promise.reject(new Error('down')), {intervalMs: 1000})
        await expect(poller.refresh()).resolves.toBeUndefined()
        expect(poller.connected.value).toBe(false)
    })
})
