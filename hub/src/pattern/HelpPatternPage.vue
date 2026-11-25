<script setup lang="ts">
import {CodeDisplay, HelpSection, HelpPage, HelpTopic} from '@emberbox/ui'
</script>

<template>
  <HelpPage title="Hilfe" back="/pattern">
    <HelpSection title="Überblick">
      <HelpTopic :paragraphs="['So sieht eine Hilfe-Seite in jedem Werkzeug aus.', 'Abschnitte fassen Themen zusammen.']"/>
    </HelpSection>
    <HelpSection title="Beitreten">
      <HelpTopic title="Codes" :paragraphs="['Jede Rolle hat ihren eigenen Code.']" mockup="Die Codes nach dem Anlegen.">
        <CodeDisplay title="Ausbilder" code="A-7K2M9QX4"/>
      </HelpTopic>
    </HelpSection>
  </HelpPage>
</template>
