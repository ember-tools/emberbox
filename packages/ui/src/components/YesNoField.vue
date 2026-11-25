<script setup lang="ts">
import UButton from '@nuxt/ui/components/Button.vue'
import UFieldGroup from '@nuxt/ui/components/FieldGroup.vue'
import UFormField from '@nuxt/ui/components/FormField.vue'
import {useId} from 'vue'

/**
 * A yes/no choice as two buttons. The stored values and the button labels are configurable, so a
 * tool can store exactly what it prints, such as `J` and `N`; `yesTitle` and `noTitle` spell out
 * labels that are abbreviations.
 */
const {
  yesValue = 'ja',
  noValue = 'nein',
  yesLabel = 'Ja',
  noLabel = 'Nein',
} = defineProps<{
  label: string
  yesValue?: string
  noValue?: string
  yesLabel?: string
  noLabel?: string
  yesTitle?: string
  noTitle?: string
  disabled?: boolean
}>()
const model = defineModel<string>({required: true})
const labelId = `${useId()}-label`
</script>

<template>
  <UFormField>
    <template #label>
      <span :id="labelId">{{ label }}</span>
    </template>
    <UFieldGroup role="group" :aria-labelledby="labelId">
      <UButton size="sm" :color="model === yesValue ? 'primary' : 'neutral'"
               :variant="model === yesValue ? 'solid' : 'outline'" :label="yesLabel" :title="yesTitle"
               :aria-label="yesTitle" :aria-pressed="model === yesValue" :disabled="disabled"
               @click="model = yesValue"/>
      <UButton size="sm" :color="model === noValue ? 'primary' : 'neutral'"
               :variant="model === noValue ? 'solid' : 'outline'" :label="noLabel" :title="noTitle"
               :aria-label="noTitle" :aria-pressed="model === noValue" :disabled="disabled"
               @click="model = noValue"/>
    </UFieldGroup>
  </UFormField>
</template>
