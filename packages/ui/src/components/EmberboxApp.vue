<script setup lang="ts">
import UApp from '@nuxt/ui/components/App.vue'
import {de} from '@nuxt/ui/locale'
import {useHead} from '@unhead/vue'
import NewBuildBanner from './NewBuildBanner.vue'

/**
 * The outer frame of every tool: Nuxt UI in German, room for toasts, tooltips and dialogs, and the
 * notice about a newer build.
 */
defineOptions({name: 'EmberboxApp'})
useHead({htmlAttrs: {lang: 'de'}})
</script>

<template>
  <UApp :locale="de">
    <div class="flex min-h-screen flex-col">
      <NewBuildBanner/>
      <slot/>
    </div>
  </UApp>
</template>
