<script setup lang="ts">
/** A section of the help with a heading that groups several topics. */
defineProps<{ title: string }>()
</script>

<template>
  <section :aria-label="title" class="flex flex-col gap-4 rounded-sm border border-default bg-default p-5">
    <h2 class="headline m-0 text-xl">{{ title }}</h2>
    <slot/>
  </section>
</template>
