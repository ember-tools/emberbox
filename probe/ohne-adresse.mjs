/** Prüft, dass `emberbox()` das Vorrendern ohne Adresse ablehnt, statt eine leere Sitemap zu bauen. */
import {emberbox} from '@emberbox/ui/vite'

try {
    emberbox({vorrendern: {eintrag: 'src/vorrendern.ts', pfade: ['/']}})
    console.error('emberbox() hat das Vorrendern ohne adresse angenommen.')
    process.exit(1)
} catch {
    console.log('Vorrendern ohne adresse wird abgelehnt.')
}
