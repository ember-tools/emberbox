<script setup lang="ts">
/**
 * A frame for help content, with an optional heading. With a title it is a named section that groups
 * several topics. Without one it is only the frame, for a help topic page whose title already stands
 * above it; its topics then carry no titles either, so the headings do not jump from h1 to h3.
 */
defineProps<{ title?: string }>()
</script>

<template>
  <component :is="title ? 'section' : 'div'" :aria-label="title"
             class="flex flex-col gap-4 rounded-sm border border-default bg-default p-5">
    <h2 v-if="title" class="headline m-0 text-xl">{{ title }}</h2>
    <slot/>
  </component>
</template>
