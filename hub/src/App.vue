<script setup lang="ts">
import {AppFuss, AppKopf, EmberboxApp} from '@emberbox/ui'
</script>

<template>
  <EmberboxApp>
    <AppKopf name="Emberbox" untertitel="Werkzeuge für die Feuerwehr" logo="/favicon.svg"/>
    <RouterView/>
    <AppFuss werkzeug="Emberbox" quelle="https://github.com/rainbowdashlabs/emberbox" lizenz="MIT"/>
  </EmberboxApp>
</template>
