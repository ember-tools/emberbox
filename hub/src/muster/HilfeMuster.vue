<script setup lang="ts">
import {CodeAnzeige, HilfeAbschnitt, HilfeSeite, HilfeThema} from '@emberbox/ui'
</script>

<template>
  <HilfeSeite titel="Hilfe" zurueck="/muster">
    <HilfeAbschnitt titel="Überblick">
      <HilfeThema :texte="['So sieht eine Hilfe-Seite in jedem Werkzeug aus.', 'Abschnitte fassen Themen zusammen.']"/>
    </HilfeAbschnitt>
    <HilfeAbschnitt titel="Beitreten">
      <HilfeThema titel="Codes" :texte="['Jede Rolle hat ihren eigenen Code.']" mockup="Die Codes nach dem Anlegen.">
        <CodeAnzeige titel="Ausbilder" code="A-7K2M9QX4"/>
      </HilfeThema>
    </HilfeAbschnitt>
  </HilfeSeite>
</template>
