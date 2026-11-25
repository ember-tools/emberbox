import alarmzettel from '@emberbox/ui/logos/alarmzettel.svg'
import calltaker from '@emberbox/ui/logos/calltaker.svg'
import statussim from '@emberbox/ui/logos/statussim.svg'

/** Ein Angebot, auf das der Hub verlinkt. */
export interface Werkzeug {
    name: string
    adresse: string
    beschreibung: string
    logo: string
    zielgruppen: string[]
    /** Die schema.org-Kategorie, etwa `EducationalApplication` für ein Übungswerkzeug. */
    kategorie: string
}

/** Ember, die Verwaltungsplattform, die der Hub hervorhebt. */
export const EMBER: Werkzeug = {
    name: 'Ember',
    adresse: 'https://ember-panel.de',
    beschreibung: 'Die offene Plattform für Jugendfeuerwehren: Mitglieder, Dienste und Organisation an einem Ort, ohne Abo.',
    logo: '/logos/ember.png',
    zielgruppen: ['Jugendfeuerwehr'],
    kategorie: 'BusinessApplication',
}

/** Die Übungswerkzeuge. Ein neues Werkzeug ist hier ein Eintrag mehr. */
export const WERKZEUGE: Werkzeug[] = [
    {
        name: 'Alarmzettel',
        adresse: 'https://alarmzettel.emberbox.app',
        beschreibung: 'Übungstage planen und die Alarmzettel für jede Einsatzübung erstellen, fertig zum Ausdrucken.',
        logo: alarmzettel,
        zielgruppen: ['Jugendfeuerwehr', 'Einsatzabteilung'],
        kategorie: 'EducationalApplication',
    },
    {
        name: 'Status Sim',
        adresse: 'https://statussim.emberbox.app',
        beschreibung: 'Funkverkehr und Fahrzeugstatus üben: Leitstelle, Staffelführer und Fahrzeuge spielen eine Übung gemeinsam am eigenen Gerät.',
        logo: statussim,
        zielgruppen: ['Jugendfeuerwehr', 'Einsatzabteilung'],
        kategorie: 'EducationalApplication',
    },
    {
        name: 'Calltaker',
        adresse: 'https://calltaker.emberbox.app',
        beschreibung: 'Notrufannahme trainieren: Anrufe annehmen, Einsatzort erfassen und mit der strukturierten Notrufabfrage zum Einsatzcode kommen.',
        logo: calltaker,
        zielgruppen: ['Einsatzabteilung', 'Leitstelle'],
        kategorie: 'EducationalApplication',
    },
]
