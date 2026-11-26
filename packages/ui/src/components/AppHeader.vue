<script setup lang="ts">
import UIcon from '@nuxt/ui/components/Icon.vue'
import ULink from '@nuxt/ui/components/Link.vue'
import UColorModeButton from '@nuxt/ui/components/color-mode/ColorModeButton.vue'
import {HUB_URL} from '../urls'

/**
 * A tool's header bar: the logo as the way back to emberbox.app, name and subtitle, navigation,
 * actions, colour mode and a slot for an account. The red signal bar runs below it. Without
 * `logo`, a grid icon takes its place.
 */
withDefaults(defineProps<{
  name: string
  subtitle?: string
  home?: string
  logo?: string
}>(), {subtitle: undefined, home: '/', logo: undefined})
</script>

<template>
  <header class="bg-default">
    <div class="mx-auto flex w-full max-w-[1560px] flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2 md:h-15 md:px-6">
      <div class="flex shrink-0 items-center gap-3">
        <ULink :to="HUB_URL" class="flex size-8 items-center justify-center rounded-sm text-muted hover:text-highlighted"
               aria-label="Alle Werkzeuge auf emberbox.app">
          <img v-if="logo" :src="logo" alt="" class="size-8 rounded-sm" />
          <UIcon v-else name="i-lucide-layout-grid" class="size-5"/>
        </ULink>
        <ULink :to="home" class="flex items-baseline gap-2 text-highlighted hover:text-highlighted">
          <span class="font-condensed text-xl font-bold uppercase tracking-wide">{{ name }}</span>
          <span v-if="subtitle" class="eyebrow hidden sm:inline">{{ subtitle }}</span>
        </ULink>
      </div>
      <nav v-if="$slots.nav" class="flex grow flex-wrap gap-x-5 gap-y-1">
        <slot name="nav"/>
      </nav>
      <div class="ml-auto flex shrink-0 items-center gap-2">
        <slot name="actions"/>
        <UColorModeButton/>
        <slot name="account"/>
      </div>
    </div>
    <div class="h-[3px] bg-signal"/>
  </header>
</template>
