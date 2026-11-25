<script setup lang="ts">
import {usePage} from '@emberbox/ui'
import ProviderDetails from '../components/ProviderDetails.vue'
import {useLegalDetails} from '../legal'

usePage({
  title: 'Impressum – Emberbox',
  description: 'Anbieterkennzeichnung von emberbox.app und den Emberbox-Werkzeugen.',
  path: '/impressum',
})

const {details, state} = useLegalDetails()
</script>

<template>
  <main class="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10 md:px-6">
    <h1 class="headline text-4xl">Impressum</h1>
    <section class="flex flex-col gap-1">
      <h2 class="field-label">Angaben gemäß § 18 Abs. 1 MStV</h2>
      <ProviderDetails :details="details" :state="state"/>
    </section>
    <section class="flex flex-col gap-2 text-muted">
      <p class="m-0">
        Dieses Impressum gilt für emberbox.app und die Werkzeuge unter *.emberbox.app: Alarmzettel, Status Sim
        und Calltaker. Emberbox ist kein offizielles Angebot einer Feuerwehr, Leitstelle oder Behörde.
      </p>
      <p class="m-0">Ember unter ember-panel.de hat ein eigenes Impressum.</p>
    </section>
  </main>
</template>
