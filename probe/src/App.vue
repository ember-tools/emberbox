<script setup lang="ts">
import {AppFuss, AppKopf, EmberboxApp} from '@emberbox/ui'
</script>

<template>
  <EmberboxApp>
    <AppKopf name="Probe" untertitel="Gepacktes Paket" logo="/favicon.svg"/>
    <RouterView/>
    <AppFuss werkzeug="Probe" quelle="https://github.com/rainbowdashlabs/emberbox" lizenz="MIT" hilfe="/hilfe"/>
  </EmberboxApp>
</template>
