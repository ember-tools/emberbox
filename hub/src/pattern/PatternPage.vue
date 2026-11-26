<script setup lang="ts">
import {CalendarDate} from '@internationalized/date'
import {
  AppFooter, AppHeader, CodeDisplay, CollapsibleSection, ComboboxField, DateTimeField, HelpSection, HelpTopic,
  MARK_KINDS, NewBuildBanner, TacticalSymbol, TextAreaField, TextField, YesNoField, markSymbolTree, unitSymbolTree,
  useConfirm, usePolling,
} from '@emberbox/ui'
import type {SymbolSpec} from '@emberbox/ui'
import type {DropdownMenuItem, TableColumn, TabsItem, AccordionItem, StepperItem} from '@nuxt/ui'
import {ref, shallowRef} from 'vue'

const colors = ['primary', 'signal', 'neutral', 'success', 'info', 'warning', 'error'] as const
const variants = ['solid', 'outline', 'soft', 'subtle', 'ghost', 'link'] as const
const symbolUnits = [
  {shape: 'vehicle', organisation: 'fire', text: 'HLF 20', size: 'group'},
  {shape: 'vehicle', organisation: 'medical', text: 'RTW'},
  {shape: 'container', organisation: 'fire', text: 'AB-Schlauch'},
  {shape: 'trailer', organisation: 'fire', text: 'TS'},
  {shape: 'boat', organisation: 'fire', text: 'MZB'},
  {shape: 'unit', organisation: 'fire', text: 'Zug', size: 'platoon'},
  {shape: 'unit', organisation: 'fire', text: 'Staffel', size: 'section'},
  {shape: 'squad', organisation: 'fire', text: 'AT', size: 'squad'},
] satisfies SymbolSpec[]

const text = ref('')
const count = ref(3)
const note = ref('')
const vehicle = ref('HLF')
const vehicles = ['HLF', 'DLK', 'RTW', 'NEF', 'ELW']
const selectedVehicles = ref<string[]>(['HLF'])
const freeText = ref('')
const checked = ref(true)
const toggled = ref(false)
const personInside = ref('yes')
const callSign = ref('')
const incident = ref('')
const police = ref('N')
const alarmDate = ref('25.11.2026')
const alarmTime = ref('08:00')
const situation = ref('')
const date = shallowRef(new CalendarDate(2026, 11, 25))
const dialog = ref(false)
const panel = ref(false)

const toast = useToast()
const confirm = useConfirm()
const answer = ref<boolean | null>(null)
const rounds = ref(0)
const {connected} = usePolling(async () => {
  rounds.value++
}, {intervalMs: 5_000})

async function askConfirmation(): Promise<void> {
  answer.value = await confirm('Sitzung löschen?', {description: 'Das lässt sich nicht rückgängig machen.', confirmLabel: 'Löschen', danger: true})
}

const menuItems: DropdownMenuItem[][] = [
  [{label: 'Teilen', icon: 'i-lucide-share-2'}, {label: 'Nur-Lesen-Link', icon: 'i-lucide-eye'}],
  [{label: 'Sitzung beenden', icon: 'i-lucide-log-out', color: 'error'}],
]

const tabs: TabsItem[] = [
  {label: 'Lage', content: 'Brand in Wohngebäude, 2. OG.'},
  {label: 'Einheiten', content: 'HLF 1, DLK, RTW.'},
]

const accordionItems: AccordionItem[] = [
  {label: 'Was ist Emberbox?', content: 'Werkzeuge für Ausbildung und Übung in der Feuerwehr.'},
  {label: 'Kostet das etwas?', content: 'Nein.'},
]

const steps: StepperItem[] = [
  {title: 'Anruf', icon: 'i-lucide-phone'},
  {title: 'Abfrage', icon: 'i-lucide-list-checks'},
  {title: 'Alarmierung', icon: 'i-lucide-siren'},
]

interface Unit {
  callSign: string
  status: number
}

const units: Unit[] = [
  {callSign: 'Florian Berlin 1100/1', status: 2},
  {callSign: 'Florian Berlin 1100/3', status: 3},
  {callSign: 'Florian Berlin 1100/4', status: 6},
]

const columns: TableColumn<Unit>[] = [
  {accessorKey: 'callSign', header: 'Rufname'},
  {accessorKey: 'status', header: 'Status'},
]
</script>

<template>
  <AppHeader name="Muster" subtitle="Emberbox-Bausteine">
    <template #nav>
      <ULink to="/pattern" class="text-highlighted">Muster</ULink>
      <ULink to="/pattern/help" class="text-muted">Hilfe</ULink>
      <ULink to="/pattern/signs" class="text-muted">Zeichen</ULink>
    </template>
    <template #actions>
      <UButton size="sm" color="neutral" variant="outline" icon="i-lucide-plus" label="Neu"/>
    </template>
  </AppHeader>
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
      <div v-for="color in colors" :key="color" class="flex flex-wrap items-center gap-2">
        <UButton v-for="variant in variants" :key="variant" :color="color" :variant="variant"
                 :label="`${color} ${variant}`"/>
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
        <UInputNumber v-model="count" class="w-full"/>
      </UFormField>
      <UFormField label="Bemerkung" class="md:col-span-2">
        <UTextarea v-model="note" class="w-full"/>
      </UFormField>
      <UFormField label="Fahrzeug">
        <USelect v-model="vehicle" :items="vehicles" class="w-full"/>
      </UFormField>
      <UFormField label="Fahrzeuge (Suche, mehrfach)">
        <USelectMenu v-model="selectedVehicles" :items="vehicles" multiple class="w-full"/>
      </UFormField>
      <UFormField label="Frei eingebbar">
        <UInputMenu v-model="freeText" :items="vehicles" class="w-full"/>
      </UFormField>
      <UFormField label="Datum">
        <UInputDate v-model="date" class="w-full"/>
      </UFormField>
      <div class="flex flex-col gap-3">
        <UCheckbox v-model="checked" label="Atemschutz"/>
        <USwitch v-model="toggled" label="Sondersignal"/>
      </div>
      <URadioGroup v-model="personInside" orientation="horizontal" variant="table" legend="Person im Gebäude?"
                   :items="[{label: 'Ja', value: 'yes'}, {label: 'Nein', value: 'no'}, {label: 'Unklar', value: 'unclear'}]"/>
    </section>

    <section class="flex flex-col gap-3">
      <h2 class="eyebrow">Überlagerungen</h2>
      <div class="flex flex-wrap gap-2">
        <UDropdownMenu :items="menuItems">
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
      <UTabs :items="tabs"/>
      <UAccordion :items="accordionItems"/>
      <UStepper :items="steps" :default-value="1"/>
      <USeparator class="md:col-span-2" label="Trenner"/>
    </section>

    <section class="flex flex-col gap-3">
      <h2 class="eyebrow">Anzeige</h2>
      <div class="flex flex-wrap gap-2">
        <UBadge v-for="color in colors" :key="color" :color="color" :label="color"/>
        <UBadge v-for="color in colors" :key="`soft-${color}`" :color="color" variant="soft" :label="color"/>
      </div>
      <UAlert color="info" variant="subtle" icon="i-lucide-info" title="Hinweis" description="Das ist eine Übung."/>
      <UAlert color="warning" variant="subtle" icon="i-lucide-triangle-alert" title="Warnung" description="Gefahrstoff gemeldet."/>
      <UAlert color="error" variant="subtle" icon="i-lucide-octagon-alert" title="Fehler" description="Verbindung verloren."/>
      <UProgress :model-value="60"/>
      <USkeleton class="h-6 w-48"/>
      <UTable :data="units" :columns="columns"/>
      <UEmpty icon="i-lucide-inbox" title="Noch keine Einsätze" description="Lege einen Einsatz an, um zu beginnen."/>
    </section>

    <section class="grid gap-4 md:grid-cols-2">
      <h2 class="eyebrow md:col-span-2">Emberbox-Felder</h2>
      <TextField v-model="callSign" label="Funkrufname" :suggestions="['Florian Berlin 1100/1', 'Florian Berlin 1100/3']"/>
      <ComboboxField v-model="incident" label="Stichwort" :suggestions="['B:Rauch', 'B:Wohnung', 'TH:Person']"/>
      <YesNoField v-model="police" label="Polizei" yes-value="J" no-value="N" yes-label="J" no-label="N" yes-title="Ja" no-title="Nein"/>
      <DateTimeField v-model:date="alarmDate" v-model:time="alarmTime" label="Einsatz"/>
      <TextAreaField v-model="situation" label="Lage" :rows="2" class="md:col-span-2"/>
      <CollapsibleSection name="pattern" title="Klappabschnitt" :count="3" icon="i-lucide-users" class="md:col-span-2">
        <template #actions>
          <UButton size="sm" color="neutral" variant="outline" icon="i-lucide-plus" label="Neu"/>
        </template>
        <p class="m-0 text-muted">Der Zustand bleibt beim Neuladen erhalten.</p>
      </CollapsibleSection>
    </section>

    <section class="flex flex-col gap-3">
      <h2 class="eyebrow">Taktische Zeichen</h2>
      <div class="flex flex-wrap items-end gap-3">
        <TacticalSymbol v-for="unit in symbolUnits" :key="unit.text" :symbol="unitSymbolTree(unit)" :width="64"/>
      </div>
      <div class="flex flex-wrap items-end gap-3">
        <TacticalSymbol v-for="kind in MARK_KINDS" :key="kind" :symbol="markSymbolTree(kind)" :width="48"/>
      </div>
    </section>

    <section class="flex flex-col gap-3">
      <h2 class="eyebrow">Emberbox-Bausteine</h2>
      <NewBuildBanner always/>
      <div class="flex flex-wrap gap-6">
        <CodeDisplay title="Ausbilder" code="A-7K2M9QX4" link="https://calltaker.emberbox.app/a/A-7K2M9QX4" qr/>
        <CodeDisplay title="Trainee" code="T-3PL8WD2N" hidden/>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <UButton color="neutral" variant="outline" label="Rückfrage" @click="askConfirmation"/>
        <span class="text-muted">Antwort: {{ answer === null ? '–' : answer ? 'bestätigt' : 'abgebrochen' }}</span>
        <UBadge :color="connected ? 'success' : 'error'" variant="soft" :label="`Polling: ${rounds} Runden`"/>
      </div>
      <HelpSection title="Hilfe-Abschnitt">
        <HelpTopic title="Ein Thema" :paragraphs="['Erster Absatz eines Hilfethemas.', 'Zweiter Absatz.']" mockup="So sieht das in der Oberfläche aus.">
          <CodeDisplay title="Beispiel" code="A-1234"/>
        </HelpTopic>
      </HelpSection>
    </section>
  </div>
  <AppFooter tool="Muster" source="https://github.com/ember-tools/emberbox" license="MIT" help="/pattern/help"/>
</template>
