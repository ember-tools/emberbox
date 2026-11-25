<script setup lang="ts">
import UButton from '@nuxt/ui/components/Button.vue'
import UModal from '@nuxt/ui/components/Modal.vue'

/** The content of a confirmation dialog; open it through `useConfirm`. */
defineProps<{
  question: string
  description?: string
  confirmLabel?: string
  danger?: boolean
}>()
const emit = defineEmits<{ close: [confirmed: boolean] }>()
</script>

<template>
  <UModal :title="question" :description="description" :dismissible="true"
          @update:open="(open: boolean) => !open && emit('close', false)">
    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <UButton color="neutral" variant="outline" label="Abbrechen" @click="emit('close', false)"/>
        <UButton :color="danger ? 'signal' : 'primary'" :label="confirmLabel ?? 'Weiter'" @click="emit('close', true)"/>
      </div>
    </template>
  </UModal>
</template>
