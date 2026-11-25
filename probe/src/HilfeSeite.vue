<script setup lang="ts">
import {HilfeAbschnitt, HilfeSeite, HilfeThema, useSeite} from '@emberbox/ui'

useSeite({titel: 'Hilfe – Probe', beschreibung: 'Die Hilfe der Probe.', pfad: '/hilfe'})
</script>

<template>
  <HilfeSeite titel="Probe-Hilfe">
    <HilfeAbschnitt titel="Überblick">
      <HilfeThema :texte="['Ein Absatz der Probe-Hilfe.']"/>
    </HilfeAbschnitt>
  </HilfeSeite>
</template>
