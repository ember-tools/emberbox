<script setup lang="ts">
import ULink from '@nuxt/ui/components/Link.vue'
import {helpPath, type HelpTopicInfo} from '../help'

/** The overview of a help center: one card per topic, with its description and a link to its page. */
defineProps<{ topics: readonly HelpTopicInfo[] }>()
</script>

<template>
  <ul class="m-0 grid list-none gap-4 p-0 md:grid-cols-2">
    <li v-for="topic in topics" :key="topic.slug">
      <ULink :to="helpPath(topic.slug)"
             class="flex h-full flex-col gap-1 rounded-sm border border-default bg-default p-5 hover:border-accented">
        <h2 class="headline m-0 text-lg text-highlighted">{{ topic.title }}</h2>
        <span class="text-muted">{{ topic.description }}</span>
      </ULink>
    </li>
  </ul>
</template>
