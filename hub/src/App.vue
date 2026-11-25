<script setup lang="ts">
import {AppFooter, AppHeader, EmberboxApp} from '@emberbox/ui'
import {computed} from 'vue'
import {useRoute} from 'vue-router'

const route = useRoute()
const bare = computed(() => route.meta.bare === true)
</script>

<template>
  <EmberboxApp>
    <AppHeader v-if="!bare" name="Emberbox" subtitle="Werkzeuge für die Feuerwehr" logo="/favicon.svg"/>
    <RouterView/>
    <AppFooter v-if="!bare" tool="Emberbox" source="https://github.com/rainbowdashlabs/emberbox" license="MIT" :backlink="false"/>
  </EmberboxApp>
</template>
