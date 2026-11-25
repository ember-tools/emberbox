<script setup lang="ts">
import UApp from '@nuxt/ui/components/App.vue'
import {de} from '@nuxt/ui/locale'
import {useHead} from '@unhead/vue'
import NeueFassung from './NeueFassung.vue'

/**
 * Der äußere Rahmen jedes Werkzeugs: Nuxt UI auf Deutsch, Platz für Meldungen, Tooltips und
 * Fenster, und der Hinweis auf einen neuen Build.
 */
defineOptions({name: 'EmberboxApp'})
useHead({htmlAttrs: {lang: 'de'}})
</script>

<template>
  <UApp :locale="de">
    <div class="flex min-h-screen flex-col">
      <NeueFassung/>
      <slot/>
    </div>
  </UApp>
</template>
