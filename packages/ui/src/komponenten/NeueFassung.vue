<script setup lang="ts">
import UButton from '@nuxt/ui/components/Button.vue'
import {useNeueFassung} from '../composables/useNeueFassung'

/**
 * Ein Hinweisband, sobald der Server einen neueren Build ausliefert, mit Knopf zum Neuladen.
 * `immer` zeigt es ohne Prüfung, etwa auf einer Musterseite.
 */
const props = defineProps<{ immer?: boolean }>()
const neu = props.immer ? true : useNeueFassung()

function neuLaden(): void {
  window.location.reload()
}
</script>

<template>
  <div v-if="neu" role="status"
       class="flex flex-wrap items-center justify-center gap-3 bg-inverted px-4 py-2 text-sm font-semibold text-inverted">
    Eine neue Version ist da. Bitte neu laden, damit alles zusammenpasst.
    <UButton size="xs" color="neutral" variant="outline" icon="i-lucide-rotate-cw" label="Neu laden"
             class="bg-default text-default" @click="neuLaden"/>
  </div>
</template>
