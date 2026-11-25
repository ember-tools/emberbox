<script setup lang="ts">
import HelpMockup from './HelpMockup.vue'

/**
 * A help topic: paragraphs and, optionally, a non-interactive replica of the interface below them
 * (the default slot), captioned with `mockup`.
 */
defineProps<{ title?: string, paragraphs: string[], mockup?: string }>()
</script>

<template>
  <div class="flex flex-col gap-2">
    <h3 v-if="title" class="m-0 text-base font-semibold text-highlighted">{{ title }}</h3>
    <p v-for="paragraph in paragraphs" :key="paragraph" class="m-0 leading-relaxed text-muted">{{ paragraph }}</p>
    <slot name="content"/>
    <HelpMockup v-if="mockup" :caption="mockup">
      <slot/>
    </HelpMockup>
  </div>
</template>
