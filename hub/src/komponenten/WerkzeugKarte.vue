<script setup lang="ts">
import type {Werkzeug} from '../werkzeuge'

/** Eine Karte mit Logo, Name, Beschreibung und Zielgruppen eines Werkzeugs, ganz als Link. */
defineProps<{ werkzeug: Werkzeug, hervorgehoben?: boolean }>()
</script>

<template>
  <a :href="werkzeug.adresse"
     class="group flex gap-4 rounded-sm border border-default bg-default p-5 transition-colors hover:border-accented"
     :class="hervorgehoben ? 'flex-col sm:flex-row sm:items-center' : 'flex-col'">
    <img :src="werkzeug.logo" alt="" width="56" height="56" class="size-14 shrink-0 rounded-sm">
    <div class="flex grow flex-col gap-2">
      <div class="flex items-center gap-2">
        <h3 class="headline m-0 text-2xl text-highlighted">{{ werkzeug.name }}</h3>
        <UIcon name="i-lucide-arrow-up-right" class="size-5 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"/>
      </div>
      <p class="m-0 text-muted">{{ werkzeug.beschreibung }}</p>
      <div class="flex flex-wrap gap-1.5">
        <UBadge v-for="gruppe in werkzeug.zielgruppen" :key="gruppe" color="neutral" variant="subtle" :label="gruppe"/>
      </div>
    </div>
    <span class="tabular text-xs text-muted sm:self-end">{{ werkzeug.adresse.replace('https://', '') }}</span>
  </a>
</template>
