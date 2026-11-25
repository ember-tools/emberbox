<script setup lang="ts">
import HilfeMockup from './HilfeMockup.vue'

/**
 * Ein Thema der Hilfe: Absätze und darunter optional ein nicht bedienbares Abbild der Oberfläche
 * (Inhalt des Standard-Slots), beschriftet mit `mockup`.
 */
defineProps<{ titel?: string, texte: string[], mockup?: string }>()
</script>

<template>
  <div class="flex flex-col gap-2">
    <h3 v-if="titel" class="m-0 text-base font-semibold text-highlighted">{{ titel }}</h3>
    <p v-for="text in texte" :key="text" class="m-0 leading-relaxed text-muted">{{ text }}</p>
    <slot name="inhalt"/>
    <HilfeMockup v-if="mockup" :beschriftung="mockup">
      <slot/>
    </HilfeMockup>
  </div>
</template>
