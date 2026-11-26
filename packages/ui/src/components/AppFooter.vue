<script setup lang="ts">
import UIcon from '@nuxt/ui/components/Icon.vue'
import ULink from '@nuxt/ui/components/Link.vue'
import {onMounted, ref} from 'vue'
import emberboxLogo from '../../logos/emberbox.svg?url'
import {buildInfo, formatBuiltAt} from '../build-info'
import {HUB_URL, IMPRINT_URL, PRIVACY_URL} from '../urls'

/**
 * A tool's footer: a notice that it is not an official offer, the way back to the Emberbox hub,
 * links to imprint, privacy policy, help and source code, copyright, license and the running
 * build. The hub itself turns the backlink off with `backlink: false`.
 */
const props = withDefaults(defineProps<{
  tool: string
  source: string
  license: string
  help?: string
  notice?: string
  backlink?: boolean
}>(), {
  help: undefined,
  notice: 'Kein offizielles Angebot einer Feuerwehr oder Leitstelle.',
  backlink: true,
})

const year = new Date(buildInfo.builtAt).getUTCFullYear() || new Date().getUTCFullYear()
const builtAt = ref('')
onMounted(() => {
  builtAt.value = formatBuiltAt()
})
const links = [
  {label: 'Impressum', to: IMPRINT_URL},
  {label: 'Datenschutz', to: PRIVACY_URL},
  ...(props.help ? [{label: 'Hilfe', to: props.help}] : []),
]
</script>

<template>
  <footer class="mt-auto border-t border-default">
    <div class="mx-auto grid w-full max-w-[1560px] gap-4 px-4 py-5 text-[13px] text-muted md:grid-cols-[1fr_auto_1fr] md:px-6">
      <p class="m-0 max-w-sm text-center md:text-left">{{ notice }}</p>
      <div class="flex flex-col items-center gap-1 text-center">
        <ULink v-if="backlink" :to="HUB_URL"
               class="mb-1 flex items-center gap-2 text-sm text-default hover:text-highlighted hover:underline">
          <img :src="emberboxLogo" alt="" width="20" height="20" class="size-5 rounded-[3px]" />
          <span>Ein Werkzeug der <strong class="font-semibold">Emberbox</strong></span>
        </ULink>
        <p class="m-0 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <template v-for="(link, index) in links" :key="link.to">
            <span v-if="index > 0" aria-hidden="true">·</span>
            <ULink :to="link.to" class="text-default hover:underline">{{ link.label }}</ULink>
          </template>
        </p>
        <ULink :to="source" target="_blank" rel="noreferrer noopener"
               class="flex items-center gap-1.5 text-default hover:underline">
          <UIcon name="i-lucide-github" aria-hidden="true"/>
          GitHub
        </ULink>
        <span>© {{ year }} RainbowDashLabs and Contributor</span>
        <span>Made with ❤️ and 🏳️‍🌈</span>
        <span>Licensed under {{ license }}</span>
        <span class="tabular">{{ tool }} {{ buildInfo.commit }} · built {{ builtAt }}</span>
      </div>
    </div>
  </footer>
</template>
