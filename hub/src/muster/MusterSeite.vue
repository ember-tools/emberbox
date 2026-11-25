<script setup lang="ts">
import {CalendarDate} from '@internationalized/date'
import {AppFuss, AppKopf, CodeAnzeige, HilfeAbschnitt, HilfeThema, NeueFassung, usePolling, useRueckfrage} from '@emberbox/ui'
import type {DropdownMenuItem, TableColumn, TabsItem, AccordionItem, StepperItem} from '@nuxt/ui'
import {ref, shallowRef} from 'vue'

const farben = ['primary', 'signal', 'neutral', 'success', 'info', 'warning', 'error'] as const
const varianten = ['solid', 'outline', 'soft', 'subtle', 'ghost', 'link'] as const

const text = ref('')
const zahl = ref(3)
const notiz = ref('')
const fahrzeug = ref('HLF')
const fahrzeuge = ['HLF', 'DLK', 'RTW', 'NEF', 'ELW']
const mehrere = ref<string[]>(['HLF'])
const frei = ref('')
const haken = ref(true)
const schalter = ref(false)
const janein = ref('ja')
const datum = shallowRef(new CalendarDate(2026, 11, 25))
const dialog = ref(false)
const panel = ref(false)

const toast = useToast()
const rueckfrage = useRueckfrage()
const antwort = ref<boolean | null>(null)
const runden = ref(0)
const {verbunden} = usePolling(async () => {
  runden.value++
}, {intervallMs: 5_000})

async function fragen(): Promise<void> {
  antwort.value = await rueckfrage('Sitzung löschen?', {erklaerung: 'Das lässt sich nicht rückgängig machen.', bestaetigung: 'Löschen', gefahr: true})
}

const menue: DropdownMenuItem[][] = [
  [{label: 'Teilen', icon: 'i-lucide-share-2'}, {label: 'Nur-Lesen-Link', icon: 'i-lucide-eye'}],
  [{label: 'Sitzung beenden', icon: 'i-lucide-log-out', color: 'error'}],
]

const reiter: TabsItem[] = [
  {label: 'Lage', content: 'Brand in Wohngebäude, 2. OG.'},
  {label: 'Einheiten', content: 'HLF 1, DLK, RTW.'},
]

const akkordeon: AccordionItem[] = [
  {label: 'Was ist Emberbox?', content: 'Werkzeuge für Ausbildung und Übung in der Feuerwehr.'},
  {label: 'Kostet das etwas?', content: 'Nein.'},
]

const schritte: StepperItem[] = [
  {title: 'Anruf', icon: 'i-lucide-phone'},
  {title: 'Abfrage', icon: 'i-lucide-list-checks'},
  {title: 'Alarmierung', icon: 'i-lucide-siren'},
]

interface Einheit {
  rufname: string
  status: number
}

const einheiten: Einheit[] = [
  {rufname: 'Florian Berlin 1100/1', status: 2},
  {rufname: 'Florian Berlin 1100/3', status: 3},
  {rufname: 'Florian Berlin 1100/4', status: 6},
]

const spalten: TableColumn<Einheit>[] = [
  {accessorKey: 'rufname', header: 'Rufname'},
  {accessorKey: 'status', header: 'Status'},
]
</script>

<template>
  <AppKopf name="Muster" untertitel="Emberbox-Bausteine">
    <template #navigation>
      <ULink to="/muster" class="text-highlighted">Muster</ULink>
      <ULink to="/muster/hilfe" class="text-muted">Hilfe</ULink>
    </template>
    <template #aktionen>
      <UButton size="sm" color="neutral" variant="outline" icon="i-lucide-plus" label="Neu"/>
    </template>
  </AppKopf>
  <div class="mx-auto max-w-5xl px-4 py-8 flex flex-col gap-10">
    <section class="flex flex-col gap-3">
      <h2 class="eyebrow">Schrift</h2>
      <p class="headline text-2xl">Barlow Condensed für Überschriften</p>
      <p>Barlow für Fließtext. Ein kurzer Absatz, wie er in einer Hilfe stehen würde.</p>
      <p class="tabular">IBM Plex Mono · 12:34:56 · 1100/3</p>
      <p class="text-muted">Gedämpfter Text</p>
    </section>

    <section class="flex flex-col gap-3">
      <h2 class="eyebrow">Knöpfe</h2>
      <div v-for="farbe in farben" :key="farbe" class="flex flex-wrap items-center gap-2">
        <UButton v-for="variante in varianten" :key="variante" :color="farbe" :variant="variante"
                 :label="`${farbe} ${variante}`"/>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <UButton icon="i-lucide-plus" label="Mit Icon"/>
        <UButton loading label="Lädt"/>
        <UButton disabled label="Gesperrt"/>
        <UButton size="xs" label="xs"/>
        <UButton size="lg" label="lg"/>
        <UFieldGroup>
          <UButton color="neutral" variant="outline" label="Links"/>
          <UButton color="neutral" variant="outline" label="Rechts"/>
        </UFieldGroup>
      </div>
    </section>

    <section class="grid gap-4 md:grid-cols-2">
      <h2 class="eyebrow md:col-span-2">Felder</h2>
      <UFormField label="Einsatzort" help="Straße und Hausnummer">
        <UInput v-model="text" placeholder="Musterstraße 1" class="w-full"/>
      </UFormField>
      <UFormField label="Anzahl" error="Mindestens eins">
        <UInputNumber v-model="zahl" class="w-full"/>
      </UFormField>
      <UFormField label="Bemerkung" class="md:col-span-2">
        <UTextarea v-model="notiz" class="w-full"/>
      </UFormField>
      <UFormField label="Fahrzeug">
        <USelect v-model="fahrzeug" :items="fahrzeuge" class="w-full"/>
      </UFormField>
      <UFormField label="Fahrzeuge (Suche, mehrfach)">
        <USelectMenu v-model="mehrere" :items="fahrzeuge" multiple class="w-full"/>
      </UFormField>
      <UFormField label="Frei eingebbar">
        <UInputMenu v-model="frei" :items="fahrzeuge" class="w-full"/>
      </UFormField>
      <UFormField label="Datum">
        <UInputDate v-model="datum" class="w-full"/>
      </UFormField>
      <div class="flex flex-col gap-3">
        <UCheckbox v-model="haken" label="Atemschutz"/>
        <USwitch v-model="schalter" label="Sondersignal"/>
      </div>
      <URadioGroup v-model="janein" orientation="horizontal" variant="table" legend="Person im Gebäude?"
                   :items="[{label: 'Ja', value: 'ja'}, {label: 'Nein', value: 'nein'}, {label: 'Unklar', value: 'unklar'}]"/>
    </section>

    <section class="flex flex-col gap-3">
      <h2 class="eyebrow">Überlagerungen</h2>
      <div class="flex flex-wrap gap-2">
        <UDropdownMenu :items="menue">
          <UButton color="neutral" variant="outline" icon="i-lucide-ellipsis" label="Menü"/>
        </UDropdownMenu>
        <UModal v-model:open="dialog" title="Sitzung löschen?" description="Das lässt sich nicht rückgängig machen.">
          <UButton color="neutral" variant="outline" label="Dialog"/>
          <template #footer>
            <UButton color="neutral" variant="ghost" label="Abbrechen" @click="dialog = false"/>
            <UButton color="error" label="Löschen" @click="dialog = false"/>
          </template>
        </UModal>
        <USlideover v-model:open="panel" title="Einstellungen">
          <UButton color="neutral" variant="outline" label="Seitenpanel"/>
          <template #body>
            <p>Inhalt des Seitenpanels.</p>
          </template>
        </USlideover>
        <UTooltip text="Kopiert den Code">
          <UButton color="neutral" variant="outline" icon="i-lucide-copy" aria-label="Kopieren"/>
        </UTooltip>
        <UButton color="neutral" variant="outline" label="Meldung"
                 @click="toast.add({title: 'Gespeichert', description: 'Die Sitzung ist abgeglichen.', color: 'success'})"/>
      </div>
    </section>

    <section class="grid gap-4 md:grid-cols-2">
      <h2 class="eyebrow md:col-span-2">Gliederung</h2>
      <UCard>
        <template #header><span class="headline text-lg">Karte</span></template>
        Inhalt einer Karte.
        <template #footer><UButton label="Weiter"/></template>
      </UCard>
      <UTabs :items="reiter"/>
      <UAccordion :items="akkordeon"/>
      <UStepper :items="schritte" :default-value="1"/>
      <USeparator class="md:col-span-2" label="Trenner"/>
    </section>

    <section class="flex flex-col gap-3">
      <h2 class="eyebrow">Anzeige</h2>
      <div class="flex flex-wrap gap-2">
        <UBadge v-for="farbe in farben" :key="farbe" :color="farbe" :label="farbe"/>
        <UBadge v-for="farbe in farben" :key="`soft-${farbe}`" :color="farbe" variant="soft" :label="farbe"/>
      </div>
      <UAlert color="info" variant="subtle" icon="i-lucide-info" title="Hinweis" description="Das ist eine Übung."/>
      <UAlert color="warning" variant="subtle" icon="i-lucide-triangle-alert" title="Warnung" description="Gefahrstoff gemeldet."/>
      <UAlert color="error" variant="subtle" icon="i-lucide-octagon-alert" title="Fehler" description="Verbindung verloren."/>
      <UProgress :model-value="60"/>
      <USkeleton class="h-6 w-48"/>
      <UTable :data="einheiten" :columns="spalten"/>
      <UEmpty icon="i-lucide-inbox" title="Noch keine Einsätze" description="Lege einen Einsatz an, um zu beginnen."/>
    </section>

    <section class="flex flex-col gap-3">
      <h2 class="eyebrow">Emberbox-Bausteine</h2>
      <NeueFassung immer/>
      <div class="flex flex-wrap gap-6">
        <CodeAnzeige titel="Ausbilder" code="A-7K2M9QX4" link="https://calltaker.emberbox.app/a/A-7K2M9QX4" qr/>
        <CodeAnzeige titel="Trainee" code="T-3PL8WD2N" verdeckt/>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <UButton color="neutral" variant="outline" label="Rückfrage" @click="fragen"/>
        <span class="text-muted">Antwort: {{ antwort === null ? '–' : antwort ? 'bestätigt' : 'abgebrochen' }}</span>
        <UBadge :color="verbunden ? 'success' : 'error'" variant="soft" :label="`Polling: ${runden} Runden`"/>
      </div>
      <HilfeAbschnitt titel="Hilfe-Abschnitt">
        <HilfeThema titel="Ein Thema" :texte="['Erster Absatz eines Hilfethemas.', 'Zweiter Absatz.']" mockup="So sieht das in der Oberfläche aus.">
          <CodeAnzeige titel="Beispiel" code="A-1234"/>
        </HilfeThema>
      </HilfeAbschnitt>
    </section>
  </div>
  <AppFuss werkzeug="Muster" quelle="https://github.com/rainbowdashlabs/emberbox" lizenz="MIT" hilfe="/muster/hilfe"/>
</template>
