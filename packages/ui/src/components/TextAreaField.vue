<script setup lang="ts">
import UFormField from '@nuxt/ui/components/FormField.vue'
import UTextarea from '@nuxt/ui/components/Textarea.vue'

/** A labelled multi-line text field. */
defineProps<{ label: string, placeholder?: string, rows?: number, disabled?: boolean }>()
const model = defineModel<string>({default: ''})
</script>

<template>
  <UFormField :label="label">
    <UTextarea v-model="model" class="w-full" :rows="rows ?? 3" :placeholder="placeholder" :disabled="disabled"/>
  </UFormField>
</template>
