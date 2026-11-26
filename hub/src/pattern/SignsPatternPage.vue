<script setup lang="ts">
import {
  CATALOG_SOURCE, DANGER_LABELS, DANGER_LABEL_PATTERNS, SIGN_ORGANISATIONS, TACTICAL_SIGN_CATALOG, TacticalSymbol, catalogSignTree,
  dangerLabelTree, environmentMarkTree, tacticalSignTree, warningPanelTree, type CatalogEntry, type SignStyle,
} from '@emberbox/ui'
import {ref} from 'vue'

/**
 * The test bench of the tactical sign catalogue: every entry with its number, name and page in
 * the recommendations, drawn in the chosen style on white, as the signs are meant to be seen, so it
 * can be checked against the printed page side by side (`./toolchain.sh sign-references` renders
 * those pages locally). Entries that are not part of the recommendations say so. Below, the danger
 * labels, the environment mark and the orange-coloured plate of the ADR.
 */
const style = ref<SignStyle>('filled')
const styles: {value: SignStyle, label: string}[] = [
  {value: 'filled', label: 'Flächig'},
  {value: 'outline', label: 'Rahmen'},
  {value: 'mono', label: 'Schwarz-Weiß'},
]

/** An entry drawn in the chosen style; the additional signs and the library's own marks have only one look. */
function drawing(entry: CatalogEntry) {
  return 'sign' in entry.drawing ? tacticalSignTree({...entry.drawing.sign, style: style.value}) : catalogSignTree(entry)
}
</script>

<template>
  <div class="mx-auto flex max-w-6xl flex-col gap-6 p-6">
    <header class="flex flex-col gap-2">
      <RouterLink to="/pattern" class="text-sm text-muted">← Musterseite</RouterLink>
      <h1 class="headline m-0 text-3xl">Prüfstand Taktische Zeichen</h1>
      <p class="m-0 text-sm text-muted">{{ CATALOG_SOURCE }}</p>
      <div class="flex flex-wrap gap-2">
        <UButton v-for="option in styles" :key="option.value" size="sm" :label="option.label"
                 :variant="style === option.value ? 'solid' : 'outline'" color="neutral" @click="style = option.value"/>
      </div>
    </header>

    <section class="flex flex-col gap-3">
      <h2 class="eyebrow">Organisationen</h2>
      <div class="flex flex-wrap gap-4">
        <span v-for="organisation in SIGN_ORGANISATIONS" :key="organisation" class="sign-backdrop">
          <TacticalSymbol :symbol="tacticalSignTree({form: 'formation', organisation, style, abbreviation: true})" :width="96"/>
        </span>
      </div>
    </section>

    <section class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <h2 class="eyebrow sm:col-span-2 lg:col-span-3">Katalog</h2>
      <figure v-for="entry in TACTICAL_SIGN_CATALOG" :key="entry.id"
              class="m-0 flex items-center gap-3 rounded-(--ui-radius) border border-default bg-default p-3">
        <span class="sign-backdrop"><TacticalSymbol :symbol="drawing(entry)" :width="96"/></span>
        <figcaption class="flex min-w-0 flex-col">
          <span class="font-mono text-sm">{{ entry.number }}</span>
          <span class="text-sm">{{ entry.name }}</span>
          <span class="text-xs text-muted">{{ entry.recommended ? `S. ${entry.page}` : 'nicht aus der Empfehlung' }}</span>
        </figcaption>
      </figure>
    </section>

    <section class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <h2 class="eyebrow sm:col-span-2 lg:col-span-3">Gefahrgut (ADR 2025)</h2>
      <figure v-for="pattern in DANGER_LABEL_PATTERNS" :key="pattern"
              class="m-0 flex items-center gap-3 rounded-(--ui-radius) border border-default bg-default p-3">
        <span class="sign-backdrop"><TacticalSymbol :symbol="dangerLabelTree(pattern)" :width="80"/></span>
        <figcaption class="flex min-w-0 flex-col">
          <span class="font-mono text-sm">Muster {{ pattern }}</span>
          <span class="text-sm">{{ DANGER_LABELS[pattern].name }}</span>
          <span class="text-xs text-muted">ADR 2025, S. {{ DANGER_LABELS[pattern].page }}</span>
        </figcaption>
      </figure>
      <figure class="m-0 flex items-center gap-3 rounded-(--ui-radius) border border-default bg-default p-3">
        <span class="sign-backdrop"><TacticalSymbol :symbol="environmentMarkTree()" :width="80"/></span>
        <figcaption class="text-sm">Kennzeichen für umweltgefährdende Stoffe (5.2.1.8.3)</figcaption>
      </figure>
      <figure class="m-0 flex items-center gap-3 rounded-(--ui-radius) border border-default bg-default p-3">
        <span class="sign-backdrop"><TacticalSymbol :symbol="warningPanelTree()" :width="96"/></span>
        <span class="sign-backdrop"><TacticalSymbol :symbol="warningPanelTree({hazardNumber: '33', unNumber: '1203'})" :width="96"/></span>
        <figcaption class="text-sm">Orangefarbene Tafel (5.3.2.2)</figcaption>
      </figure>
    </section>
  </div>
</template>

<style scoped>
.sign-backdrop {
  display: inline-flex;
  padding: 4px;
  border-radius: 4px;
  background: #ffffff;
}
</style>
