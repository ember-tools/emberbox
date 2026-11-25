<script setup lang="ts">
import {AppFooter, AppHeader, EmberboxApp} from '@emberbox/ui'
</script>

<template>
  <EmberboxApp>
    <AppHeader name="Emberbox" subtitle="Werkzeuge für die Feuerwehr" logo="/favicon.svg"/>
    <RouterView/>
    <AppFooter tool="Emberbox" source="https://github.com/rainbowdashlabs/emberbox" license="MIT" :backlink="false"/>
  </EmberboxApp>
</template>
