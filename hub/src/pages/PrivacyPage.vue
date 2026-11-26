<script setup lang="ts">
import {usePage} from '@emberbox/ui'
import ProviderDetails from '../components/ProviderDetails.vue'
import {HOSTER, useLegalDetails} from '../legal'

usePage({
  title: 'Datenschutz – Emberbox',
  description: 'Welche Daten emberbox.app und die Emberbox-Werkzeuge verarbeiten, wozu und wie lange.',
  path: '/datenschutz',
})

const {details, state} = useLegalDetails()
</script>

<template>
  <main class="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10 leading-relaxed md:px-6">
    <h1 class="headline text-4xl">Datenschutz</h1>

    <section class="flex flex-col gap-2">
      <h2 class="headline text-2xl">Überblick</h2>
      <p class="m-0">
        Diese Erklärung gilt für emberbox.app und die Werkzeuge Alarmzettel (alarmzettel.emberbox.app),
        Status Sim (statussim.emberbox.app), Calltaker (calltaker.emberbox.app), Planspielplatte
        (planspiel.emberbox.app) und Förderstrecke (foerderstrecke.emberbox.app). Keines davon verlangt eine
        Anmeldung, zeigt Werbung oder setzt Analyse- oder Tracking-Dienste ein. Schriften, Symbole und
        Kartenkacheln kommen von unseren Servern; beim Aufruf wird nichts von einem fremden Dienst geladen.
      </p>
      <p class="m-0">Ember unter ember-panel.de ist ein eigenes Angebot mit eigener Datenschutzerklärung.</p>
    </section>

    <section class="flex flex-col gap-2">
      <h2 class="headline text-2xl">Verantwortlich</h2>
      <ProviderDetails :details="details" :state="state"/>
    </section>

    <section class="flex flex-col gap-2">
      <h2 class="headline text-2xl">Betrieb und Zugriffsprotokolle</h2>
      <p class="m-0">
        Alle Seiten laufen auf Servern {{ HOSTER }}. Bei jedem Aufruf verarbeitet der Server technisch notwendig
        die IP-Adresse, den Zeitpunkt, die aufgerufene Adresse, den Statuscode und die Angabe des Browsers. Daraus
        entstehen Zugriffsprotokolle, die wir zum sicheren Betrieb und zur Fehlersuche nutzen und nach
        {{ details?.logRetentionDays ?? 'wenigen' }} Tagen löschen. Rechtsgrundlage ist unser berechtigtes
        Interesse an einem sicheren und funktionierenden Angebot (Art. 6 Abs. 1 lit. f DSGVO). Mit Hetzner
        besteht ein Vertrag zur Auftragsverarbeitung.
      </p>
      <p class="m-0">
        Vor den Servern steht das Netzwerk von Cloudflare (Cloudflare, Inc., USA). Jeder Aufruf läuft darüber,
        sodass Cloudflare dieselben Verbindungsdaten verarbeitet, um die Seiten auszuliefern und vor Angriffen
        zu schützen. Rechtsgrundlage ist ebenfalls Art. 6 Abs. 1 lit. f DSGVO. Cloudflare ist unter dem
        EU-US Data Privacy Framework zertifiziert; mit Cloudflare besteht ein Vertrag zur Auftragsverarbeitung.
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
        Kartenkacheln für die Lagekarte und die Punktauswahl holt der Server selbst von OpenStreetMap und liefert
        sie aus; der Browser stellt dafür keine Verbindung zu OpenStreetMap her.
      </p>
    </section>

    <section class="flex flex-col gap-2">
      <h2 class="headline text-2xl">Status Sim</h2>
      <p class="m-0">
        Eine Übung speichert auf dem Server die Namen der Leitstelle und der Fahrzeuge, die Statusmeldungen und den
        Funkverlauf, damit alle Beteiligten denselben Stand sehen. Zugang hat nur, wer einen der Übungscodes kennt.
        Die Daten einer Übung werden sieben Tage nach dem letzten Zugriff gelöscht. Im Browser merkt sich Status Sim
        je Übungscode den verwendeten Namen, den Funkkanal und eine Ansichtseinstellung; Einträge, die sieben Tage
        nicht genutzt wurden, entfernt es beim nächsten Speichern. Rechtsgrundlage ist unser
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
      <h2 class="headline text-2xl">Planspielplatte</h2>
      <p class="m-0">
        Eine Platte entsteht im lokalen Speicher des Browsers. Was darin steht – Fahrzeuge, Funkrufnamen, Wachen,
        Lagemeldungen –, bestimmen die Nutzenden selbst; Namen von Personen gehören nicht hinein. Dazu merkt sich der
        Browser, ob Lagestände animiert gewechselt werden, und die zuletzt geöffneten geteilten Platten mit
        Schlüssel, Titel und Zeitpunkt.
      </p>
      <p class="m-0">
        Wer eine Platte teilt, legt sie auf dem Server ab. Zugang hat, wer den Link zum Bearbeiten oder den Link zum
        Zusehen kennt; der zweite erlaubt nur das Ansehen. Eine geteilte Platte bleibt gespeichert, bis sie über den
        Link zum Bearbeiten gelöscht wird; wer diesen Link verloren hat, kann die Löschung über die oben genannte
        Adresse verlangen. Weil die Links den Zugang enthalten, werden die Aufrufe der
        Planspielplatte nicht in die Zugriffsprotokolle geschrieben. Rechtsgrundlage ist unser berechtigtes
        Interesse, die gewünschte gemeinsame Bearbeitung bereitzustellen (Art. 6 Abs. 1 lit. f DSGVO).
      </p>
      <p class="m-0">
        Kartenkacheln holt der Server selbst von OpenStreetMap und liefert sie aus; der Browser stellt dafür keine
        Verbindung zu OpenStreetMap her. Der Server löscht eine Kachel, die 30 Tage lang niemand aufgerufen hat.
      </p>
      <p class="m-0">
        Für die Adresssuche gibt der Server den Suchtext an Photon weiter, einen Dienst der komoot GmbH,
        Kienberger Allee 4, 12529 Schönefeld, der Orte aus OpenStreetMap findet. Photon erhält nur den Suchtext
        und die Adresse unseres Servers, nicht die IP-Adresse der Nutzenden. Der Server speichert die Suchtexte
        nicht dauerhaft und protokolliert sie nicht; gleiche Suchen hält er höchstens zehn Minuten im
        Arbeitsspeicher vor, um Photon nicht doppelt zu fragen. Rechtsgrundlage ist unser berechtigtes Interesse,
        die gewünschte Suche bereitzustellen (Art. 6 Abs. 1 lit. f DSGVO).
      </p>
    </section>

    <section class="flex flex-col gap-2">
      <h2 class="headline text-2xl">Förderstrecke</h2>
      <p class="m-0">
        Eine Strecke entsteht im lokalen Speicher des Browsers: der Verlauf der Leitung, Höhen, Pumpen, Einstellungen
        und ein Titel, den die Nutzenden selbst wählen; Namen von Personen gehören nicht hinein. Ebenso merkt sich der
        Browser die aktuelle Rechenaufgabe, welche Aufgaben gelöst wurden, und die selbst erstellten Links mit dem
        Schlüssel zum Löschen.
      </p>
      <p class="m-0">
        Für die Höhen schickt der Browser den Verlauf der Leitung an unseren Server. Der Server liest die Höhen aus
        einer eigenen Kopie des Höhenmodells Copernicus DEM; kein anderer Dienst erhält die Koordinaten. Der Server
        speichert sie nicht und protokolliert sie nicht.
      </p>
      <p class="m-0">
        Wer eine Strecke oder Aufgabe teilt, legt eine Kopie davon mit dem Zeitpunkt der Erstellung auf dem Server
        ab. Zugang hat, wer den Link kennt; er öffnet eine eigene Kopie. Eine geteilte Strecke oder Aufgabe bleibt
        gespeichert, bis sie im Browser, der den Link erstellt hat, gelöscht wird; wer das nicht mehr kann, kann die Löschung über die oben genannte Adresse
        verlangen. Weil die Links den Zugang enthalten, werden die Aufrufe der Förderstrecke nicht in die
        Zugriffsprotokolle geschrieben. Rechtsgrundlage ist unser berechtigtes Interesse, die gewünschte Berechnung
        und das Teilen bereitzustellen (Art. 6 Abs. 1 lit. f DSGVO).
      </p>
      <p class="m-0">
        Kartenkacheln holt der Server selbst von OpenStreetMap und liefert sie aus; der Browser stellt dafür keine
        Verbindung zu OpenStreetMap her. Der Server löscht eine Kachel, die 30 Tage lang niemand aufgerufen hat.
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
