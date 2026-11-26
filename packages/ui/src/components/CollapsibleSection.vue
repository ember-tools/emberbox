<script setup lang="ts">
import UCard from '@nuxt/ui/components/Card.vue'
import UIcon from '@nuxt/ui/components/Icon.vue'
import {onMounted, ref, useId, watch} from 'vue'

/**
 * A section that can be collapsed. With many lists open at once a page is something to scroll
 * through rather than read. The browser remembers what was open, under `name` in the object stored
 * at `storageKey`, so all sections of a tool share one entry. The remembered state is applied after
 * mounting, so prerendered pages hydrate with `defaultOpen` first.
 */
const {
  name, title, count = undefined, icon = undefined, defaultOpen = false, storageKey = 'emberbox_sections', level = 2,
} = defineProps<{
  /** Key under which the state is remembered. */
  name: string
  /** The browser storage entry that holds the state of all sections. */
  storageKey?: string
  title: string
  /** What the section holds, visible without opening it. */
  count?: number
  /** An icon before the title, where the section is one of several kinds. */
  icon?: string
  /** How it starts while nothing is remembered. */
  defaultOpen?: boolean
  /** The heading level of the title within the page. */
  level?: 2 | 3 | 4
}>()

const bodyId = `${useId()}-body`
const open = ref(defaultOpen)

function remembered(): boolean {
  try {
    const state = JSON.parse(localStorage.getItem(storageKey) ?? '{}')?.[name]
    return state === undefined ? defaultOpen : Boolean(state)
  } catch {
    return defaultOpen
  }
}

onMounted(() => {
  open.value = remembered()
  watch(open, value => {
    try {
      const state = JSON.parse(localStorage.getItem(storageKey) ?? '{}') ?? {}
      localStorage.setItem(storageKey, JSON.stringify({...state, [name]: value}))
    } catch {
      return
    }
  })
})
</script>

<template>
  <UCard :ui="{body: 'p-4 sm:p-4'}">
    <div class="flex flex-wrap items-center gap-3">
      <component :is="`h${level}`" class="section-title m-0 grow">
        <button type="button" class="flex w-full items-center gap-3 text-left" :aria-expanded="open"
                :aria-controls="open ? bodyId : undefined" @click="open = !open">
          <UIcon :name="open ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'" class="text-muted"/>
          <UIcon v-if="icon" :name="icon" class="text-muted"/>
          <span>{{ title }}</span>
          <span v-if="count !== undefined" class="tabular text-sm font-normal normal-case tracking-normal text-muted">
            {{ count }}
          </span>
        </button>
      </component>
      <slot v-if="open" name="actions"/>
    </div>
    <div v-if="open" :id="bodyId" class="mt-3">
      <slot/>
    </div>
  </UCard>
</template>
