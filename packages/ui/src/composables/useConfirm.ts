import {useOverlay} from '@nuxt/ui/composables'
import ConfirmDialog from '../components/ConfirmDialog.vue'

/** What a confirmation shows besides the question itself. */
export interface ConfirmOptions {
    /** A sentence below the question, such as what the action does. */
    description?: string
    /** The label of the confirming button. */
    confirmLabel?: string
    /** Whether the action destroys something; the button then shows in signal red. */
    danger?: boolean
}

/**
 * An in-page confirmation instead of `window.confirm`, which blocks the whole page and with it
 * every running request. Call it in the `setup` of a component inside `EmberboxApp`. Every
 * confirmation creates its own dialog and removes it after closing.
 *
 * @returns a function that opens the confirmation and resolves to `true` when confirmed
 */
export function useConfirm() {
    const overlay = useOverlay()
    return async (question: string, options: ConfirmOptions = {}): Promise<boolean> => {
        const dialog = overlay.create(ConfirmDialog, {destroyOnClose: true})
        return Boolean(await dialog.open({question, ...options}).result)
    }
}
