import {useHead, useSeoMeta} from '@unhead/vue'

declare const __EMBERBOX_ADRESSE__: string | undefined
declare const __EMBERBOX_BILD__: string | undefined

/** Die öffentliche Adresse des Werkzeugs, wie sie `emberbox({adresse})` beim Bauen setzt. */
export const ADRESSE = typeof __EMBERBOX_ADRESSE__ === 'string' ? __EMBERBOX_ADRESSE__ : ''

/** Das Vorschaubild, wenn eine Seite keines nennt: das Logo des Werkzeugs aus `emberbox({logo})`. */
const STANDARD_BILD = typeof __EMBERBOX_BILD__ === 'string' ? __EMBERBOX_BILD__ : ''

/** Was Suchmaschinen und Link-Vorschauen über eine Seite erfahren. */
export interface SeitenAngaben {
    /** Der vollständige Titel, wie er im Tab und in Suchergebnissen steht. */
    titel: string
    /** Ein bis zwei Sätze für Suchergebnisse und Vorschauen. */
    beschreibung: string
    /** Der Pfad der Seite; mit `adresse` wird daraus die kanonische Adresse. */
    pfad?: string
    /** `false` für Seiten, die nicht in Suchergebnisse gehören, etwa Übungen mit Code. */
    indexieren?: boolean
    /** Vorschaubild als absolute Adresse oder als Pfad unter `adresse`; sonst das Logo. */
    bild?: string
    /** Strukturierte Daten (JSON-LD), etwa aus `werkzeugDaten`. */
    daten?: object[]
}

function absolut(pfad: string): string {
    return /^https?:\/\//.test(pfad) ? pfad : `${ADRESSE}${pfad}`
}

/**
 * Setzt Titel, Beschreibung, kanonische Adresse, OpenGraph- und Twitter-Angaben, `robots` und
 * strukturierte Daten einer Seite. Wirkt im Browser und beim Vorrendern gleich.
 */
export function useSeite(angaben: SeitenAngaben): void {
    const indexieren = angaben.indexieren ?? true
    const url = angaben.pfad !== undefined && ADRESSE ? absolut(angaben.pfad) : undefined
    const bildQuelle = angaben.bild ?? STANDARD_BILD
    const bild = bildQuelle && ADRESSE ? absolut(bildQuelle) : undefined
    useHead({
        title: angaben.titel,
        link: url ? [{rel: 'canonical', href: url}] : [],
        script: (angaben.daten ?? []).map(daten => ({type: 'application/ld+json', innerHTML: JSON.stringify(daten)})),
    })
    useSeoMeta({
        description: angaben.beschreibung,
        robots: indexieren ? 'index, follow' : 'noindex, nofollow',
        ogType: 'website',
        ogLocale: 'de_DE',
        ogSiteName: 'Emberbox',
        ogTitle: angaben.titel,
        ogDescription: angaben.beschreibung,
        ogUrl: url,
        ogImage: bild,
        twitterCard: angaben.bild ? 'summary_large_image' : 'summary',
    })
}

/** Was ein Werkzeug über sich als Webanwendung angibt. */
export interface WerkzeugAngaben {
    name: string
    beschreibung: string
    adresse?: string
}

/** Strukturierte Daten (schema.org `WebApplication`) für die Startseite eines Werkzeugs. */
export function werkzeugDaten(angaben: WerkzeugAngaben): object {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: angaben.name,
        description: angaben.beschreibung,
        url: angaben.adresse ?? (ADRESSE || undefined),
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Web',
        inLanguage: 'de',
        isAccessibleForFree: true,
        offers: {'@type': 'Offer', price: '0', priceCurrency: 'EUR'},
    }
}
