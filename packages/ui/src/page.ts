import {useHead, useSeoMeta} from '@unhead/vue'
import {computed, type MaybeRefOrGetter, toValue} from 'vue'

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
 * structured data. Works the same in the browser and when prerendering. Pass a getter when the page
 * stays mounted while its content changes, such as one route for every help topic.
 *
 * @param meta what the page states, or a getter for it
 */
export function usePage(meta: MaybeRefOrGetter<PageMeta>): void {
    const page = computed(() => toValue(meta))
    const url = computed(() => (page.value.path !== undefined && SITE_URL ? absolute(page.value.path) : undefined))
    const image = computed(() => {
        const source = page.value.image ?? DEFAULT_IMAGE
        return source && SITE_URL ? absolute(source) : undefined
    })
    useHead(() => ({
        title: page.value.title,
        link: url.value ? [{rel: 'canonical', href: url.value}] : [],
        script: (page.value.structuredData ?? []).map(data => ({type: 'application/ld+json', innerHTML: JSON.stringify(data)})),
    }))
    useSeoMeta({
        description: () => page.value.description,
        robots: () => ((page.value.index ?? true) ? 'index, follow' : 'noindex, nofollow'),
        ogType: 'website',
        ogLocale: 'de_DE',
        ogSiteName: 'Emberbox',
        ogTitle: () => page.value.title,
        ogDescription: () => page.value.description,
        ogUrl: () => url.value,
        ogImage: () => image.value,
        twitterCard: () => (page.value.image ? 'summary_large_image' : 'summary'),
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

/** One step of a breadcrumb trail. */
export interface BreadcrumbStep {
    /** What the step is called. */
    name: string
    /** The step's path below the tool's address. */
    path: string
}

/**
 * Structured data (JSON-LD) for a breadcrumb trail, such as tool, help and topic, which search engines
 * show instead of the bare address.
 *
 * @param steps the trail from the tool's start page down to the current page
 * @returns the `BreadcrumbList` for `usePage({structuredData})`
 */
export function breadcrumbData(steps: BreadcrumbStep[]): object {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: steps.map((step, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: step.name,
            item: SITE_URL ? `${SITE_URL}${step.path}` : undefined,
        })),
    }
}
