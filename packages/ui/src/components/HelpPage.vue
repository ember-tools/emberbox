<script setup lang="ts">
import ULink from '@nuxt/ui/components/Link.vue'

/** The frame of a help page: title, a way back and the sections below. */
withDefaults(defineProps<{ title: string, back?: string }>(), {back: '/'})
</script>

<template>
  <main class="mx-auto flex w-full max-w-4xl flex-col gap-6 p-5">
    <header class="flex flex-col items-center gap-1 text-center">
      <h1 class="headline m-0 text-3xl">{{ title }}</h1>
      <ULink :to="back" class="text-sm underline">Zurück</ULink>
    </header>
    <slot/>
  </main>
</template>
