<script setup lang="ts">
import {useSeite} from '@emberbox/ui'
import {ANBIETER} from '../rechtliches'

useSeite({
  titel: 'Impressum – Emberbox',
  beschreibung: 'Anbieterkennzeichnung von emberbox.app und den Emberbox-Werkzeugen.',
  pfad: '/impressum',
})
</script>

<template>
  <main class="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10 md:px-6">
    <h1 class="headline text-4xl">Impressum</h1>
    <section class="flex flex-col gap-1">
      <h2 class="feld-label">Angaben gemäß § 18 Abs. 1 MStV</h2>
      <p class="m-0">{{ ANBIETER.name }}</p>
      <p v-for="zeile in ANBIETER.anschrift" :key="zeile" class="m-0">{{ zeile }}</p>
    </section>
    <section class="flex flex-col gap-1">
      <h2 class="feld-label">Kontakt</h2>
      <p class="m-0">E-Mail: {{ ANBIETER.email }}</p>
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
