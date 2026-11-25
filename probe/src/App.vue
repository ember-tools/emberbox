<script setup lang="ts">
import {AppFooter, AppHeader, EmberboxApp} from '@emberbox/ui'
</script>

<template>
  <EmberboxApp>
    <AppHeader name="Probe" subtitle="Gepacktes Paket" logo="/favicon.svg"/>
    <RouterView/>
    <AppFooter tool="Probe" source="https://github.com/ember-tools/emberbox" license="MIT" help="/hilfe"/>
  </EmberboxApp>
</template>
