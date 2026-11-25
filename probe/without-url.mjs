/** Checks that `emberbox()` refuses to prerender without a url instead of writing an empty sitemap. */
import {emberbox} from '@emberbox/ui/vite'

try {
    emberbox({prerender: {entry: 'src/prerender.ts', paths: ['/']}})
    console.error('emberbox() accepted prerendering without a url.')
    process.exit(1)
} catch {
    console.log('Prerendering without a url is refused.')
}
