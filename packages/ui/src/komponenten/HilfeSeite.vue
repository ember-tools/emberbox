<script setup lang="ts">
import ULink from '@nuxt/ui/components/Link.vue'

/** Der Rahmen einer Hilfe-Seite: Titel, Rücksprung und darunter die Abschnitte. */
withDefaults(defineProps<{ titel: string, zurueck?: string }>(), {zurueck: '/'})
</script>

<template>
  <main class="mx-auto flex w-full max-w-4xl flex-col gap-6 p-5">
    <header class="flex flex-col items-center gap-1 text-center">
      <h1 class="headline m-0 text-3xl">{{ titel }}</h1>
      <ULink :to="zurueck" class="text-sm underline">Zurück</ULink>
    </header>
    <slot/>
  </main>
</template>
