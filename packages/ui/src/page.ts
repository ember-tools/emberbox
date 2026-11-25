import {useHead, useSeoMeta} from '@unhead/vue'

declare const __EMBERBOX_URL__: string | undefined
declare const __EMBERBOX_IMAGE__: string | undefined

/** The tool's public address, as `emberbox({url})` sets it at build time. */
export const SITE_URL = typeof __EMBERBOX_URL__ === 'string' ? __EMBERBOX_URL__ : ''

/** The preview image when a page names none: the tool's logo from `emberbox({logo})`. */
const DEFAULT_IMAGE = typeof __EMBERBOX_IMAGE__ === 'string' ? __EMBERBOX_IMAGE__ : ''

/** What search engines and link previews learn about a page. */
export interface PageMeta {
    /** The full title as it appears in the tab and in search results. */
    title: string
    /** One or two sentences for search results and previews. */
    description: string
    /** The page's path; together with `url` it becomes the canonical address. */
    path?: string
    /** `false` for pages that do not belong in search results, such as exercises with a code. */
    index?: boolean
    /** Preview image as an absolute address or a path below `url`; the logo otherwise. */
    image?: string
    /** Structured data (JSON-LD), for example from `webApplicationData`. */
    structuredData?: object[]
}

function absolute(path: string): string {
    return /^https?:\/\//.test(path) ? path : `${SITE_URL}${path}`
}

/**
 * Sets a page's title, description, canonical address, OpenGraph and Twitter tags, `robots` and
 * structured data. Works the same in the browser and when prerendering.
 */
export function usePage(meta: PageMeta): void {
    const index = meta.index ?? true
    const url = meta.path !== undefined && SITE_URL ? absolute(meta.path) : undefined
    const imageSource = meta.image ?? DEFAULT_IMAGE
    const image = imageSource && SITE_URL ? absolute(imageSource) : undefined
    useHead({
        title: meta.title,
        link: url ? [{rel: 'canonical', href: url}] : [],
        script: (meta.structuredData ?? []).map(data => ({type: 'application/ld+json', innerHTML: JSON.stringify(data)})),
    })
    useSeoMeta({
        description: meta.description,
        robots: index ? 'index, follow' : 'noindex, nofollow',
        ogType: 'website',
        ogLocale: 'de_DE',
        ogSiteName: 'Emberbox',
        ogTitle: meta.title,
        ogDescription: meta.description,
        ogUrl: url,
        ogImage: image,
        twitterCard: meta.image ? 'summary_large_image' : 'summary',
    })
}

/** What a tool states about itself as a web application. */
export interface WebApplicationInfo {
    name: string
    description: string
    url?: string
}

/** Structured data (schema.org `WebApplication`) for a tool's start page. */
export function webApplicationData(info: WebApplicationInfo): object {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: info.name,
        description: info.description,
        url: info.url ?? (SITE_URL || undefined),
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Web',
        inLanguage: 'de',
        isAccessibleForFree: true,
        offers: {'@type': 'Offer', price: '0', priceCurrency: 'EUR'},
    }
}
