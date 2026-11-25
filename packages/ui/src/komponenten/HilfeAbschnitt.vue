<script setup lang="ts">
/** Ein Abschnitt der Hilfe mit Überschrift, der mehrere Themen zusammenfasst. */
defineProps<{ titel: string }>()
</script>

<template>
  <section :aria-label="titel" class="flex flex-col gap-4 rounded-sm border border-default bg-default p-5">
    <h2 class="headline m-0 text-xl">{{ titel }}</h2>
    <slot/>
  </section>
</template>
