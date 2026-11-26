<script setup lang="ts">
import {CodeDisplay, HelpIndex, HelpSection, HelpPage, HelpTopic} from '@emberbox/ui'

/** Two made-up topics, to show the overview of a help center with subpages. */
const TOPICS = [
  {slug: 'anlegen', title: 'Übung anlegen', description: 'So entsteht eine Übung.'},
  {slug: 'drucken', title: 'Drucken', description: 'So kommt der Zettel aufs Papier.'},
]
</script>

<template>
  <HelpPage title="Hilfe" back="/pattern">
    <HelpIndex :topics="TOPICS"/>
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
