<script setup lang="ts">
import UButton from '@nuxt/ui/components/Button.vue'
import {useNewBuild} from '../composables/useNewBuild'

/**
 * A banner shown as soon as the server serves a newer build, with a button to reload. `always`
 * shows it without checking, for example on a pattern page.
 */
const props = defineProps<{ always?: boolean }>()
const newer = props.always ? true : useNewBuild()

function reload(): void {
  window.location.reload()
}
</script>

<template>
  <div v-if="newer" role="status"
       class="flex flex-wrap items-center justify-center gap-3 bg-inverted px-4 py-2 text-sm font-semibold text-inverted">
    Eine neue Version ist da. Bitte neu laden, damit alles zusammenpasst.
    <UButton size="xs" color="neutral" variant="outline" icon="i-lucide-rotate-cw" label="Neu laden"
             class="bg-default text-default" @click="reload"/>
  </div>
</template>
