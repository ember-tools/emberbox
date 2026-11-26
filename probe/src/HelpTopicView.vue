<script setup lang="ts">
import {breadcrumbData, HelpPage, HelpSection, HelpTopic, helpPath, usePage} from '@emberbox/ui'
import {computed} from 'vue'
import {HELP_TOPICS} from './help-topics'

const props = defineProps<{ slug: string }>()
const topic = computed(() => HELP_TOPICS.find(candidate => candidate.slug === props.slug)!)

usePage(() => ({
    title: `${topic.value.title} – Hilfe – Probe`,
    description: topic.value.description,
    path: helpPath(topic.value.slug),
    structuredData: [breadcrumbData([
        {name: 'Probe', path: '/'},
        {name: 'Hilfe', path: helpPath()},
        {name: topic.value.title, path: helpPath(topic.value.slug)},
    ])],
}))
</script>

<template>
  <HelpPage :title="topic.title" :topics="HELP_TOPICS" :current="topic.slug">
    <HelpSection :title="topic.title">
      <HelpTopic :paragraphs="[topic.description]"/>
    </HelpSection>
  </HelpPage>
</template>
