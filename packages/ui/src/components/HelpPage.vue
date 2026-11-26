<script setup lang="ts">
import ULink from '@nuxt/ui/components/Link.vue'
import {computed} from 'vue'
import {HELP_PATH, helpPath, type HelpTopicInfo} from '../help'

/**
 * The frame of a help page: title, a way back and the sections below. On a topic of a help center
 * with subpages (`topics` and `current`) it also lists the other topics and links to the next one, and
 * the way back leads to the overview.
 */
const props = defineProps<{ title: string, back?: string, topics?: readonly HelpTopicInfo[], current?: string }>()

const backTo = computed(() => props.back ?? (props.current ? HELP_PATH : '/'))
const backLabel = computed(() => (props.current && !props.back ? 'Alle Hilfethemen' : 'Zurück'))
const next = computed(() => {
    const index = props.topics?.findIndex(topic => topic.slug === props.current) ?? -1
    return index >= 0 ? props.topics?.[index + 1] : undefined
})
</script>

<template>
  <main class="mx-auto flex w-full max-w-4xl flex-col gap-6 p-5">
    <header class="flex flex-col items-center gap-1 text-center">
      <h1 class="headline m-0 text-3xl">{{ title }}</h1>
      <ULink :to="backTo" class="text-sm underline">{{ backLabel }}</ULink>
    </header>
    <nav v-if="topics && current" aria-label="Hilfethemen">
      <ul class="m-0 flex list-none flex-wrap justify-center gap-x-4 gap-y-1 p-0 text-sm">
        <li v-for="topic in topics" :key="topic.slug">
          <ULink :to="helpPath(topic.slug)" :aria-current="topic.slug === current ? 'page' : undefined"
                 :class="topic.slug === current ? 'font-semibold text-highlighted' : 'text-muted underline'">
            {{ topic.title }}
          </ULink>
        </li>
      </ul>
    </nav>
    <slot/>
    <ULink v-if="next" :to="helpPath(next.slug)" class="self-end underline">Weiter: {{ next.title }}</ULink>
  </main>
</template>
