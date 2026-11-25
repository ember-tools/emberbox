<script setup lang="ts">
import {CodeAnzeige, useSeite, werkzeugDaten} from '@emberbox/ui'

useSeite({
  titel: 'Probe – Emberbox',
  beschreibung: 'Eine leere App, die prüft, ob das gepackte Paket baut und vorrendert.',
  pfad: '/',
  daten: [werkzeugDaten({name: 'Probe', beschreibung: 'Prüft das gepackte Paket.'})],
})
</script>

<template>
  <main class="mx-auto flex max-w-3xl flex-col gap-4 p-6">
    <h1 class="headline text-3xl">Probe-Startseite</h1>
    <UButton icon="i-lucide-play" label="Übung starten"/>
    <CodeAnzeige titel="Ausbilder" code="A-PROBE"/>
  </main>
</template>
