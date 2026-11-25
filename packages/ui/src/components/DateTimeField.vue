<script setup lang="ts">
import UFormField from '@nuxt/ui/components/FormField.vue'
import UInput from '@nuxt/ui/components/Input.vue'
import {computed} from 'vue'

/**
 * One date-time field for a date and a time kept as two strings in German notation, as a printed
 * form shows them. They are entered with the browser's picker, which brings a calendar and a clock.
 * The field reads `19.9.2026` and `8:00` as well as zero-padded values, and writes zero-padded ones
 * (`19.09.2026`, `08:00`). A date without a time shows as midnight, so the first edit writes
 * `00:00`; a date that does not exist, such as `31.2.2026`, shows as an empty field.
 */
const date = defineModel<string>('date', {default: ''})
const time = defineModel<string>('time', {default: ''})
const {label, disabled} = defineProps<{ label: string, disabled?: boolean }>()
/** Fires only once both values are set, so listeners never see half a change. */
const emit = defineEmits<{ change: [] }>()

/** Turns "19.9.2026" and "08:00" into what a `datetime-local` understands, or into nothing. */
const value = computed(() => {
  const day = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(date.value.trim())
  const clock = /^(\d{1,2}):(\d{2})/.exec(time.value.trim())
  if (!day) return ''
  const isoDay = `${day[3]}-${day[2]!.padStart(2, '0')}-${day[1]!.padStart(2, '0')}`
  return clock ? `${isoDay}T${clock[1]!.padStart(2, '0')}:${clock[2]}` : `${isoDay}T00:00`
})

/** Back to the slip's notation; clearing the field clears both values. */
function update(input: string) {
  const parts = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(input)
  if (!parts) {
    date.value = ''
    time.value = ''
  } else {
    date.value = `${parts[3]}.${parts[2]}.${parts[1]}`
    time.value = `${parts[4]}:${parts[5]}`
  }
  emit('change')
}
</script>

<template>
  <UFormField :label="label">
    <UInput :model-value="value" type="datetime-local" step="60" class="w-full" :disabled="disabled"
            @change="update(($event.target as HTMLInputElement).value)"/>
  </UFormField>
</template>
