import {afterEach, beforeEach, expect, it, vi} from 'vitest'
import {createApp, defineComponent, h} from 'vue'
import {usePolling} from './usePolling'

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

it('polls while mounted and stops on unmount', async () => {
    const request = vi.fn().mockResolvedValue(undefined)
    let controls: ReturnType<typeof usePolling> | undefined
    const app = createApp(defineComponent({
        setup() {
            controls = usePolling(request, {intervalMs: 1000})
            return () => h('div')
        },
    }))
    app.mount(document.createElement('div'))
    await vi.advanceTimersByTimeAsync(0)
    expect(request).toHaveBeenCalledTimes(1)
    expect(controls?.connected.value).toBe(true)
    app.unmount()
    await vi.advanceTimersByTimeAsync(5000)
    expect(request).toHaveBeenCalledTimes(1)
})
