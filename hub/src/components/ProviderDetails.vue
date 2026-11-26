<script setup lang="ts">
import type {LegalDetails} from '../legal'

/** The provider's name, address and e-mail, or a notice while they load or when they are missing. */
defineProps<{ details: LegalDetails | null, state: 'loading' | 'ready' | 'missing' }>()
</script>

<template>
  <template v-if="state === 'ready' && details">
    <p class="m-0">{{ details.provider.name }}</p>
    <p v-for="line in details.provider.address" :key="line" class="m-0">{{ line }}</p>
    <p class="m-0">E-Mail: {{ details.provider.email }}</p>
  </template>
  <p v-else-if="state === 'loading'" class="m-0 text-muted">Die Anbieterangaben werden geladen …</p>
  <p v-else class="m-0 text-muted">
    Die Anbieterangaben konnten nicht geladen werden. Bitte die Seite später erneut aufrufen.
  </p>
</template>
