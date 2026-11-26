/** Where every tool's help center lives. */
export const HELP_PATH = '/hilfe'

/** One topic of a help center, which becomes its own page below `/hilfe`. */
export interface HelpTopicInfo {
    /** The last part of the topic's address, such as `pdf-drucken`. */
    slug: string
    /** The topic's heading, also used in the overview and the navigation. */
    title: string
    /** One sentence on what the topic explains, shown in the overview and used for search results. */
    description: string
}

/**
 * The address of a help topic, or of the overview when no topic is given.
 *
 * @param slug the topic's slug
 * @returns the path
 */
export function helpPath(slug?: string): string {
    return slug ? `${HELP_PATH}/${slug}` : HELP_PATH
}

/**
 * The addresses of a help center, the overview first, for `prerender.paths` and with it the sitemap.
 *
 * Needs only the slugs, so a tool's `vite.config.ts` can call it through `@emberbox/ui/vite`, and a tool
 * whose titles come from vue-i18n can keep a plain list of slugs for it.
 *
 * @param topics the help center's topics, or just their slugs
 * @returns the paths
 */
export function helpPaths(topics: readonly (string | Pick<HelpTopicInfo, 'slug'>)[]): string[] {
    return [HELP_PATH, ...topics.map(topic => helpPath(typeof topic === 'string' ? topic : topic.slug))]
}

