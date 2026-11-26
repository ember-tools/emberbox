import {onMounted, ref} from 'vue'

/** Who provides emberbox.app and the tools, as named in the imprint and the privacy policy. */
export interface Provider {
    name: string
    address: string[]
    email: string
}

/**
 * The operator's details that stay out of the repository. The hub reads them from `/legal.json`,
 * which the deployment mounts at `/etc/emberbox/legal.json`; see `legal.example.json`.
 */
export interface LegalDetails {
    provider: Provider
    logRetentionDays: number
}

/** Where the servers run. */
export const HOSTER = 'der Hetzner Online GmbH, Industriestr. 25, 91710 Gunzenhausen, in Rechenzentren in Deutschland'

/** Accepts the parsed file only when every field the pages show is present and of the right kind. */
function asLegalDetails(value: unknown): LegalDetails | null {
    const details = value as Partial<LegalDetails> | null
    const provider = details?.provider
    const valid = typeof provider?.name === 'string'
        && Array.isArray(provider.address) && provider.address.every(line => typeof line === 'string')
        && typeof provider.email === 'string'
        && typeof details?.logRetentionDays === 'number'
    return valid ? details as LegalDetails : null
}

/**
 * Loads the operator's details once the page runs in the browser. Prerendered HTML and the first
 * client render both show the loading state, so hydration never disagrees; `missing` means the
 * deployment has no valid `/legal.json`.
 */
export function useLegalDetails() {
    const details = ref<LegalDetails | null>(null)
    const state = ref<'loading' | 'ready' | 'missing'>('loading')
    onMounted(async () => {
        try {
            const response = await fetch('/legal.json', {cache: 'no-cache'})
            details.value = response.ok ? asLegalDetails(await response.json()) : null
        } catch {
            details.value = null
        }
        state.value = details.value ? 'ready' : 'missing'
    })
    return {details, state}
}
