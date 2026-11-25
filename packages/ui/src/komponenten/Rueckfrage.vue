<script setup lang="ts">
import UButton from '@nuxt/ui/components/Button.vue'
import UModal from '@nuxt/ui/components/Modal.vue'

/** Der Inhalt eines Bestätigungsfensters; geöffnet wird es über `useRueckfrage`. */
defineProps<{
  frage: string
  erklaerung?: string
  bestaetigung?: string
  gefahr?: boolean
}>()
const emit = defineEmits<{ close: [bestaetigt: boolean] }>()
</script>

<template>
  <UModal :title="frage" :description="erklaerung" :dismissible="true" @update:open="(offen: boolean) => !offen && emit('close', false)">
    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <UButton color="neutral" variant="outline" label="Abbrechen" @click="emit('close', false)"/>
        <UButton :color="gefahr ? 'signal' : 'primary'" :label="bestaetigung ?? 'Weiter'" @click="emit('close', true)"/>
      </div>
    </template>
  </UModal>
</template>
