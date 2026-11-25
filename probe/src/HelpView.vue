<script setup lang="ts">
import {HelpPage, HelpSection, HelpTopic, usePage} from '@emberbox/ui'

usePage({title: 'Hilfe – Probe', description: 'Die Hilfe der Probe.', path: '/hilfe'})
</script>

<template>
  <HelpPage title="Probe-Hilfe">
    <HelpSection title="Überblick">
      <HelpTopic :paragraphs="['Ein Absatz der Probe-Hilfe.']"/>
    </HelpSection>
  </HelpPage>
</template>
