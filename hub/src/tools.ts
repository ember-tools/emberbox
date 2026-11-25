import alarmzettel from '@emberbox/ui/logos/alarmzettel.svg'
import calltaker from '@emberbox/ui/logos/calltaker.svg'
import statussim from '@emberbox/ui/logos/statussim.svg'

/** An offer the hub links to. */
export interface Tool {
    name: string
    url: string
    description: string
    logo: string
    audiences: string[]
    /** The schema.org category, such as `EducationalApplication` for an exercise tool. */
    category: string
    /** The public repository with the source code. */
    source: string
    /** The short name of the tool's license, as shown on the card. */
    license: string
    /** The start of the tool's help center. */
    help: string
}

/** Ember, the management platform the hub highlights. */
export const EMBER: Tool = {
    name: 'Ember',
    url: 'https://ember-panel.de',
    description: 'Die offene Plattform für Jugendfeuerwehren: Mitglieder, Dienste und Organisation an einem Ort, ohne Abo.',
    logo: '/logos/ember.png',
    audiences: ['Jugendfeuerwehr'],
    category: 'BusinessApplication',
    source: 'https://github.com/rainbowdashlabs/ember',
    license: 'AGPL-3.0',
    help: 'https://ember-panel.de/helpcenter/station/basics',
}

/** The exercise tools. A new tool is one more entry here. */
export const TOOLS: Tool[] = [
    {
        name: 'Alarmzettel',
        url: 'https://alarmzettel.emberbox.app',
        description: 'Übungstage planen und die Alarmzettel für jede Einsatzübung erstellen, fertig zum Ausdrucken.',
        logo: alarmzettel,
        audiences: ['Jugendfeuerwehr', 'Einsatzabteilung'],
        category: 'EducationalApplication',
        source: 'https://github.com/rainbowdashlabs/alarmzettel',
        license: 'AGPL-3.0',
        help: 'https://alarmzettel.emberbox.app/hilfe',
    },
    {
        name: 'Status Sim',
        url: 'https://statussim.emberbox.app',
        description: 'Funkverkehr und Fahrzeugstatus üben: Leitstelle, Staffelführer und Fahrzeuge spielen eine Übung gemeinsam am eigenen Gerät.',
        logo: statussim,
        audiences: ['Jugendfeuerwehr', 'Einsatzabteilung'],
        category: 'EducationalApplication',
        source: 'https://github.com/rainbowdashlabs/status-sim',
        license: 'GPL-3.0',
        help: 'https://statussim.emberbox.app/hilfe',
    },
    {
        name: 'Calltaker',
        url: 'https://calltaker.emberbox.app',
        description: 'Notrufannahme trainieren: Anrufe annehmen, Einsatzort erfassen und mit der strukturierten Notrufabfrage zum Einsatzcode kommen.',
        logo: calltaker,
        audiences: ['Einsatzabteilung', 'Leitstelle'],
        category: 'EducationalApplication',
        source: 'https://github.com/ember-tools/calltaker',
        license: 'AGPL-3.0',
        help: 'https://calltaker.emberbox.app/hilfe',
    },
]
