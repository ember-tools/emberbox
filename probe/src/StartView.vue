<script setup lang="ts">
import {CodeDisplay, CollapsibleSection, TextField, usePage, webApplicationData} from '@emberbox/ui'
import {ref} from 'vue'

const name = ref('')

usePage({
  title: 'Probe – Emberbox',
  description: 'Eine leere App, die prüft, ob das gepackte Paket baut und vorrendert.',
  path: '/',
  structuredData: [webApplicationData({name: 'Probe', description: 'Prüft das gepackte Paket.'})],
})
</script>

<template>
  <main class="mx-auto flex max-w-3xl flex-col gap-4 p-6">
    <h1 class="headline text-3xl">Probe-Startseite</h1>
    <UButton icon="i-lucide-play" label="Übung starten"/>
    <CodeDisplay title="Ausbilder" code="A-PROBE"/>
    <TextField v-model="name" label="Probe-Feld" :suggestions="['Eins', 'Zwei']"/>
    <CollapsibleSection name="probe" title="Probe-Abschnitt" default-open>
      <p>Inhalt des Probe-Abschnitts.</p>
    </CollapsibleSection>
  </main>
</template>
