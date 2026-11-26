<script setup lang="ts">
import {t} from '../text'

/** The choice this browser made last time. */
const CHOICE = 'probe.choice'

const remembered = localStorage.getItem(CHOICE) ?? ''
</script>

<template>
  <main>
    <h1>{{ t('page.title') }}</h1>
    <p>{{ t('page.count') }}</p>
    <p>{{ remembered }}</p>
  </main>
</template>
