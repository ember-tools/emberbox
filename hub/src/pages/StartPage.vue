<script setup lang="ts">
import {usePage} from '@emberbox/ui'
import ToolCard from '../components/ToolCard.vue'
import {EMBER, TOOLS} from '../tools'

const DESCRIPTION = 'Kostenlose Werkzeuge für Ausbildung und Übung in der Feuerwehr: Alarmzettel, '
    + 'Funk- und Statusübungen, Notrufannahme und Ember für die Jugendfeuerwehr.'

usePage({
  title: 'Emberbox – Werkzeuge für Ausbildung und Übung in der Feuerwehr',
  description: DESCRIPTION,
  path: '/',
  structuredData: [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Emberbox',
      url: 'https://emberbox.app/',
      inLanguage: 'de',
      description: DESCRIPTION,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: [EMBER, ...TOOLS].map((tool, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'WebApplication',
          name: tool.name,
          url: tool.url,
          description: tool.description,
          applicationCategory: tool.category,
          operatingSystem: 'Web',
          inLanguage: 'de',
          isAccessibleForFree: true,
        },
      })),
    },
  ],
})
</script>

<template>
  <main class="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-10 md:px-6 md:py-14">
    <section class="flex max-w-3xl flex-col gap-3">
      <p class="eyebrow">Emberbox</p>
      <h1 class="headline text-4xl md:text-5xl">Werkzeuge für Ausbildung und Übung in der Feuerwehr</h1>
      <p class="text-lg text-muted">
        Übungen planen, Funk und Status üben, Notrufe annehmen: kostenlos, im Browser und ohne Anmeldung.
        Für Jugendfeuerwehr und Einsatzabteilung.
      </p>
    </section>

    <section aria-labelledby="ember" class="flex flex-col gap-4">
      <h2 id="ember" class="eyebrow">Für die Jugendfeuerwehr</h2>
      <ToolCard :tool="EMBER" featured/>
    </section>

    <section aria-labelledby="tools" class="flex flex-col gap-4">
      <h2 id="tools" class="eyebrow">Werkzeuge zum Üben</h2>
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <ToolCard v-for="tool in TOOLS" :key="tool.name" :tool="tool"/>
      </div>
    </section>
  </main>
</template>
