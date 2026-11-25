import {type Component, createApp, createSSRApp} from 'vue'

/**
 * Creates a tool's app in the browser. On a prerendered page Vue takes over the existing HTML
 * (hydration), otherwise it builds the page from scratch. Wait for `router.isReady()` before
 * `mount`, so hydration hits the same page.
 */
export function createToolApp(root: Component) {
    const prerendered = (document.getElementById('app')?.childElementCount ?? 0) > 0
    return prerendered ? createSSRApp(root) : createApp(root)
}
