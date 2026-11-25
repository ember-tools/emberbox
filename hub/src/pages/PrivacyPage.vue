<script setup lang="ts">
import {usePage} from '@emberbox/ui'
import {OPERATION, PROVIDER, STATUSSIM_RETENTION} from '../legal'

usePage({
  title: 'Datenschutz – Emberbox',
  description: 'Welche Daten emberbox.app und die Emberbox-Werkzeuge verarbeiten, wozu und wie lange.',
  path: '/datenschutz',
})
</script>

<template>
  <main class="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10 leading-relaxed md:px-6">
    <h1 class="headline text-4xl">Datenschutz</h1>

    <section class="flex flex-col gap-2">
      <h2 class="headline text-2xl">Überblick</h2>
      <p class="m-0">
        Diese Erklärung gilt für emberbox.app und die Werkzeuge Alarmzettel (alarmzettel.emberbox.app),
        Status Sim (statussim.emberbox.app) und Calltaker (calltaker.emberbox.app). Keines davon verlangt eine
        Anmeldung, zeigt Werbung oder setzt Analyse- oder Tracking-Dienste ein. Schriften und Symbole liegen auf
        unseren Servern; beim Aufruf werden sie von keinem fremden Dienst geladen. Ausnahmen nennt diese Erklärung
        beim jeweiligen Werkzeug.
      </p>
      <p class="m-0">Ember unter ember-panel.de ist ein eigenes Angebot mit eigener Datenschutzerklärung.</p>
    </section>

    <section class="flex flex-col gap-2">
      <h2 class="headline text-2xl">Verantwortlich</h2>
      <p class="m-0">{{ PROVIDER.name }}</p>
      <p v-for="line in PROVIDER.address" :key="line" class="m-0">{{ line }}</p>
      <p class="m-0">E-Mail: {{ PROVIDER.email }}</p>
    </section>

    <section class="flex flex-col gap-2">
      <h2 class="headline text-2xl">Betrieb und Zugriffsprotokolle</h2>
      <p class="m-0">
        Alle Seiten laufen auf Servern bei {{ OPERATION.hoster }}. Bei jedem Aufruf verarbeitet der Server
        technisch notwendig die IP-Adresse, den Zeitpunkt, die aufgerufene Adresse, den Statuscode und die Angabe
        des Browsers. Daraus entstehen Zugriffsprotokolle, die wir zum sicheren Betrieb und zur Fehlersuche nutzen
        und nach {{ OPERATION.logRetentionDays }} Tagen löschen. Rechtsgrundlage ist unser berechtigtes Interesse an
        einem sicheren und funktionierenden Angebot (Art. 6 Abs. 1 lit. f DSGVO).
      </p>
    </section>

    <section class="flex flex-col gap-2">
      <h2 class="headline text-2xl">Speicher im Browser</h2>
      <p class="m-0">
        Alle Seiten merken sich im lokalen Speicher des Browsers, ob sie hell oder dunkel erscheinen sollen. Die
        Werkzeuge legen dort weitere Angaben ab, die unten beim jeweiligen Werkzeug stehen. Diese Angaben bleiben
        auf dem Gerät, bis sie im Werkzeug oder über die Browsereinstellungen gelöscht werden. Sie sind für die
        gewünschte Funktion unbedingt erforderlich (§ 25 Abs. 2 Nr. 2 TDDDG).
      </p>
    </section>

    <section class="flex flex-col gap-2">
      <h2 class="headline text-2xl">Alarmzettel</h2>
      <p class="m-0">
        Planungen und Alarmzettel entstehen in einer Arbeitsmappe, die der Browser im lokalen Speicher hält. Was
        darin steht, bestimmen die Nutzenden selbst; Namen von Personen gehören nur hinein, wenn es für die Übung
        nötig ist. Dazu merkt sich der Browser den Namen, unter dem gearbeitet wird, die zuletzt genutzten
        Sitzungen mit Schlüssel, Bezeichnung und Zeitpunkt sowie einige Ansichtseinstellungen.
      </p>
      <p class="m-0">
        Wer gemeinsam arbeiten will, legt eine Sitzung an. Dann liegt die Arbeitsmappe zusätzlich auf dem Server,
        und ein Cookie hält den Sitzungsschlüssel. Zugang hat, wer den Sitzungs-Link oder den Lese-Link kennt;
        der Lese-Link erlaubt nur das Ansehen. Eine Sitzung wird 30 Tage nach ihrer letzten Nutzung gelöscht.
        Rechtsgrundlage ist unser berechtigtes Interesse, die gewünschte gemeinsame Bearbeitung bereitzustellen
        (Art. 6 Abs. 1 lit. f DSGVO).
      </p>
      <p class="m-0">
        Die Karten (Lagekarte und Punktauswahl) laden Kartenkacheln von OpenStreetMap (OpenStreetMap Foundation,
        Vereinigtes Königreich). Dabei erhält deren Server die IP-Adresse und die angezeigten Kartenausschnitte.
        Rechtsgrundlage ist unser berechtigtes Interesse an einer Kartendarstellung (Art. 6 Abs. 1 lit. f DSGVO).
        Für das Vereinigte Königreich besteht ein Angemessenheitsbeschluss der EU-Kommission.
      </p>
    </section>

    <section class="flex flex-col gap-2">
      <h2 class="headline text-2xl">Status Sim</h2>
      <p class="m-0">
        Eine Übung speichert auf dem Server die Namen der Leitstelle und der Fahrzeuge, die Statusmeldungen und den
        Funkverlauf, damit alle Beteiligten denselben Stand sehen. Zugang hat nur, wer einen der Übungscodes kennt.
        Die Daten einer Übung werden nach {{ STATUSSIM_RETENTION }} gelöscht. Im Browser merkt sich Status Sim
        je Übungscode den verwendeten Namen, den Funkkanal und eine Ansichtseinstellung. Rechtsgrundlage ist unser
        berechtigtes Interesse, die gewünschte gemeinsame Übung bereitzustellen (Art. 6 Abs. 1 lit. f DSGVO).
      </p>
    </section>

    <section class="flex flex-col gap-2">
      <h2 class="headline text-2xl">Calltaker</h2>
      <p class="m-0">
        Eine Übung lebt nur im Arbeitsspeicher des Servers. Sie verschwindet zwölf Stunden, nachdem sie zuletzt
        jemand geöffnet hatte, spätestens aber beim Neustart des Servers. Zugang hat nur, wer einen der
        Übungscodes kennt. Anrufer, Adressen und Lagen sind erfunden oder stammen aus offenen Daten. Kartenkacheln
        holt der Server selbst und liefert sie aus; der Browser stellt dafür keine Verbindung zu OpenStreetMap
        her. Ob der Klingelton an ist, merkt sich der Browser. Rechtsgrundlage ist unser berechtigtes Interesse,
        die gewünschte Übung bereitzustellen (Art. 6 Abs. 1 lit. f DSGVO).
      </p>
    </section>

    <section class="flex flex-col gap-2">
      <h2 class="headline text-2xl">Ihre Rechte</h2>
      <p class="m-0">
        Sie haben das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung, auf
        Datenübertragbarkeit und auf Widerspruch gegen eine Verarbeitung aus berechtigtem Interesse
        (Art. 15 bis 21 DSGVO). Wenden Sie sich dafür an die oben genannte Adresse. Außerdem können Sie sich bei
        einer Datenschutz-Aufsichtsbehörde beschweren (Art. 77 DSGVO).
      </p>
    </section>
  </main>
</template>
