<script setup lang="ts">
import UFormField from '@nuxt/ui/components/FormField.vue'
import UInput from '@nuxt/ui/components/Input.vue'
import {computed, useId} from 'vue'

/** A labelled single-line text field, optionally offering suggestions from a list while typing. */
const props = defineProps<{
  label: string
  suggestions?: string[]
  placeholder?: string
  /** Spans two columns in a grid. */
  wide?: boolean
  disabled?: boolean
}>()

defineEmits<{ change: [] }>()
const model = defineModel<string>({default: ''})
const id = useId()
const listId = computed(() => props.suggestions?.length ? `${id}-list` : undefined)
</script>

<template>
  <UFormField :label="label" :class="wide ? 'col-span-2' : ''">
    <UInput v-model="model" class="w-full" :list="listId" :placeholder="placeholder" :disabled="disabled" @change="$emit('change')"/>
    <datalist v-if="listId" :id="listId">
      <option v-for="value in suggestions" :key="value" :value="value"/>
    </datalist>
  </UFormField>
</template>
