<script setup lang="ts">
import UButton from '@nuxt/ui/components/Button.vue'
import UFormField from '@nuxt/ui/components/FormField.vue'
import UInput from '@nuxt/ui/components/Input.vue'
import {computed, nextTick, ref, useId, watch} from 'vue'

/**
 * A text field that also opens the list it draws on, so an entry can be picked rather than typed,
 * while anything typed stays the value. A bare datalist offers no visible way in.
 */
const props = defineProps<{
  label: string
  suggestions: string[]
  placeholder?: string
  wide?: boolean
  /** The list already answers the typing; filtering it again here would only cut it down. */
  prefiltered?: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{ change: [] }>()
const model = defineModel<string>({default: ''})
const id = useId()
const labelId = `${id}-label`
const input = ref<{ inputRef: HTMLInputElement | null }>()
const open = ref(false)

/** Which entry the arrow keys are on, or -1 while the typing stands on its own. */
const active = ref(-1)

/**
 * Typing narrows the list, but a value taken from the list matches only itself, so a field that
 * already holds an entry would offer that one alone. Showing everything once the text is an exact
 * hit keeps the list usable for changing one's mind.
 */
const filtered = computed(() => {
  const search = model.value.trim().toLowerCase()
  if (props.prefiltered || !search) return props.suggestions
  if (props.suggestions.some(value => value.toLowerCase() === search)) return props.suggestions
  return props.suggestions.filter(value => value.toLowerCase().includes(search))
})

const visible = computed(() => open.value && filtered.value.length > 0)
const optionId = (index: number) => `${id}-option-${index}`

function pick(value: string) {
  model.value = value
  close()
  emit('change')
}

function close() {
  open.value = false
  active.value = -1
}

function toggle() {
  open.value = !open.value
  active.value = -1
  if (open.value) input.value?.inputRef?.focus()
}

/**
 * Wraps at both ends, so holding one arrow key walks the whole list either way. With nothing
 * highlighted yet, down starts at the top and up at the bottom.
 */
async function move(steps: number) {
  const count = filtered.value.length
  if (!count) return
  open.value = true
  active.value = active.value < 0
      ? (steps > 0 ? 0 : count - 1)
      : (active.value + steps + count) % count
  await nextTick()
  document.getElementById(optionId(active.value))?.scrollIntoView({block: 'nearest'})
}

/**
 * Enter takes the highlighted entry. With nothing highlighted it only closes the list and is
 * otherwise left alone, so the input fires its own change event for what was typed and a
 * surrounding form still submits.
 */
function confirm(event: KeyboardEvent) {
  const chosen = visible.value ? filtered.value[active.value] : undefined
  if (chosen === undefined) {
    close()
    return
  }
  event.preventDefault()
  pick(chosen)
}

/** Escape closes an open list without also closing a dialog around the field. */
function escape(event: KeyboardEvent) {
  if (!visible.value) return
  event.stopPropagation()
  close()
}

watch(filtered, () => (active.value = -1))
</script>

<template>
  <UFormField :class="wide ? 'col-span-2' : ''" class="relative">
    <template #label>
      <span :id="labelId">{{ label }}</span>
    </template>
    <UInput ref="input" v-model="model" class="w-full" :placeholder="placeholder" :disabled="disabled" autocomplete="off"
            role="combobox" aria-autocomplete="list" :aria-expanded="visible"
            :aria-controls="visible ? `${id}-list` : undefined"
            :aria-activedescendant="active >= 0 ? optionId(active) : undefined"
            @focus="open = true" @blur="close" @change="emit('change')"
            @keydown.down.prevent="move(1)" @keydown.up.prevent="move(-1)" @keydown.enter="confirm"
            @keydown.tab="close" @keydown.escape="escape">
      <template v-if="suggestions.length" #trailing>
        <UButton color="neutral" variant="link" size="sm" icon="i-lucide-chevron-down" tabindex="-1"
                 aria-label="Auswahl öffnen" :aria-expanded="visible" :disabled="disabled"
                 @mousedown.prevent @click="toggle"/>
      </template>
    </UInput>
    <ul v-if="visible" :id="`${id}-list`" role="listbox" :aria-labelledby="labelId"
        class="absolute inset-x-0 top-full z-30 mt-1 max-h-64 overflow-auto rounded-sm border border-default bg-default py-1 shadow-lg">
      <li v-for="(value, index) in filtered" :id="optionId(index)" :key="`${index}-${value}`" role="option"
          :aria-selected="index === active"
          class="cursor-pointer px-3 py-1.5 text-sm"
          :class="[index === active ? 'bg-elevated' : '', value === model ? 'font-semibold' : '']"
          @mousedown.prevent="pick(value)" @mousemove="active = index">
        {{ value }}
      </li>
    </ul>
  </UFormField>
</template>
