<script setup lang="ts">
import type {Tool} from '../tools'

/**
 * A card with a tool's logo, name, description and audiences, plus links to its help and source
 * and its license. The name's link covers the whole card; the other links sit above it as links of
 * their own, since links cannot nest.
 */
defineProps<{ tool: Tool, featured?: boolean }>()
</script>

<template>
  <article
      class="group relative flex gap-4 rounded-sm border border-default bg-default p-5 transition-colors hover:border-accented"
      :class="featured ? 'flex-col sm:flex-row sm:items-center' : 'flex-col'">
    <img :src="tool.logo" alt="" width="56" height="56" class="size-14 shrink-0 rounded-sm">
    <div class="flex grow flex-col gap-2">
      <h3 class="headline m-0 text-2xl text-highlighted">
        <a :href="tool.url" class="flex items-center gap-2 after:absolute after:inset-0 after:content-['']">
          {{ tool.name }}
          <UIcon name="i-lucide-arrow-up-right"
                 class="size-5 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"/>
        </a>
      </h3>
      <p class="m-0 text-muted">{{ tool.description }}</p>
      <div class="flex flex-wrap gap-1.5">
        <UBadge v-for="audience in tool.audiences" :key="audience" color="neutral" variant="subtle" :label="audience"/>
      </div>
    </div>
    <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted sm:self-end"
         :class="featured ? 'sm:flex-col sm:items-end' : ''">
      <a :href="tool.help" class="relative z-10 flex items-center gap-1.5 hover:text-highlighted hover:underline"
         :aria-label="`Hilfe zu ${tool.name}`">
        <UIcon name="i-lucide-life-buoy" class="size-4"/>
        Hilfe
      </a>
      <a :href="tool.source" target="_blank" rel="noreferrer noopener"
         class="relative z-10 flex items-center gap-1.5 hover:text-highlighted hover:underline"
         :aria-label="`Quellcode von ${tool.name} auf GitHub`">
        <UIcon name="i-lucide-github" class="size-4"/>
        GitHub
      </a>
      <span :title="`Lizenz: ${tool.license}`">{{ tool.license }}</span>
      <span class="tabular">{{ tool.url.replace('https://', '') }}</span>
    </div>
  </article>
</template>
