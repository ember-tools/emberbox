<script setup lang="ts">
import ULink from '@nuxt/ui/components/Link.vue'
import UIcon from '@nuxt/ui/components/Icon.vue'
import {DATENSCHUTZ_URL, HUB_URL, IMPRESSUM_URL} from '../adressen'
import {onMounted, ref} from 'vue'
import {fassung, gebautLesbar} from '../fassung'

/**
 * Der Fuß eines Werkzeugs: Hinweis, dass es kein offizielles Angebot ist, Links zu emberbox.app,
 * Impressum, Datenschutz, Hilfe und Quellcode, Urheber, Lizenz und der laufende Build.
 */
const props = withDefaults(defineProps<{
  werkzeug: string
  quelle: string
  lizenz: string
  hilfe?: string
  hinweis?: string
}>(), {
  hinweis: 'Kein offizielles Angebot einer Feuerwehr oder Leitstelle.',
})

const jahr = new Date(fassung.gebaut).getUTCFullYear() || new Date().getUTCFullYear()
const gebaut = ref('')
onMounted(() => {
  gebaut.value = gebautLesbar()
})
const links = [
  {label: 'emberbox.app', to: HUB_URL},
  {label: 'Impressum', to: IMPRESSUM_URL},
  {label: 'Datenschutz', to: DATENSCHUTZ_URL},
  ...(props.hilfe ? [{label: 'Hilfe', to: props.hilfe}] : []),
]
</script>

<template>
  <footer class="mt-auto border-t border-default">
    <div class="mx-auto grid w-full max-w-[1560px] gap-4 px-4 py-5 text-[13px] text-muted md:grid-cols-[1fr_auto_1fr] md:px-6">
      <p class="m-0 max-w-sm text-center md:text-left">{{ hinweis }}</p>
      <div class="flex flex-col items-center gap-1 text-center">
        <p class="m-0 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <template v-for="(link, index) in links" :key="link.to">
            <span v-if="index > 0" aria-hidden="true">·</span>
            <ULink :to="link.to" class="text-default hover:underline">{{ link.label }}</ULink>
          </template>
        </p>
        <ULink :to="quelle" target="_blank" rel="noreferrer noopener"
               class="flex items-center gap-1.5 text-default hover:underline">
          <UIcon name="i-lucide-github" aria-hidden="true"/>
          GitHub
        </ULink>
        <span>© {{ jahr }} RainbowDashLabs and Contributor</span>
        <span>Made with ❤️ and 🏳️‍🌈</span>
        <span>Licensed under {{ lizenz }}</span>
        <span class="tabular">{{ werkzeug }} {{ fassung.commit }} · built {{ gebaut }}</span>
      </div>
    </div>
  </footer>
</template>
