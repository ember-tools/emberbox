<script setup lang="ts">
import UIcon from '@nuxt/ui/components/Icon.vue'
import ULink from '@nuxt/ui/components/Link.vue'
import UColorModeButton from '@nuxt/ui/components/color-mode/ColorModeButton.vue'
import {HUB_URL} from '../adressen'

/**
 * Die Kopfleiste eines Werkzeugs: das Logo als Rücksprung zu emberbox.app, Name und Untertitel,
 * Navigation, Aktionen, Farbmodus und ein Platz für ein Konto. Darunter liegt der rote
 * Signalbalken. Ohne `logo` steht an seiner Stelle ein Raster-Symbol.
 */
withDefaults(defineProps<{
  name: string
  untertitel?: string
  start?: string
  logo?: string
}>(), {start: '/'})
</script>

<template>
  <header class="bg-default">
    <div class="mx-auto flex w-full max-w-[1560px] flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2 md:h-15 md:px-6">
      <div class="flex shrink-0 items-center gap-3">
        <ULink :to="HUB_URL" class="flex size-8 items-center justify-center rounded-sm text-muted hover:text-highlighted"
               aria-label="Alle Werkzeuge auf emberbox.app">
          <img v-if="logo" :src="logo" alt="" class="size-8 rounded-sm">
          <UIcon v-else name="i-lucide-layout-grid" class="size-5"/>
        </ULink>
        <ULink :to="start" class="flex items-baseline gap-2 text-highlighted hover:text-highlighted">
          <span class="font-condensed text-xl font-bold uppercase tracking-wide">{{ name }}</span>
          <span v-if="untertitel" class="eyebrow hidden sm:inline">{{ untertitel }}</span>
        </ULink>
      </div>
      <nav v-if="$slots.navigation" class="flex grow flex-wrap gap-x-5 gap-y-1">
        <slot name="navigation"/>
      </nav>
      <div class="ml-auto flex shrink-0 items-center gap-2">
        <slot name="aktionen"/>
        <UColorModeButton/>
        <slot name="konto"/>
      </div>
    </div>
    <div class="h-[3px] bg-signal"/>
  </header>
</template>
