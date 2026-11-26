<script setup lang="ts">
import {HelpIndex, HelpPage, usePage} from '@emberbox/ui'
import {HELP_TOPICS} from './help-topics'

usePage({title: 'Hilfe – Probe', description: 'Die Hilfe der Probe.', path: '/hilfe'})
</script>

<template>
  <HelpPage title="Probe-Hilfe">
    <HelpIndex :topics="HELP_TOPICS"/>
  </HelpPage>
</template>
