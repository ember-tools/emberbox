<script setup lang="ts">
import UButton from '@nuxt/ui/components/Button.vue'
import UPopover from '@nuxt/ui/components/Popover.vue'
import UTooltip from '@nuxt/ui/components/Tooltip.vue'
import {renderSVG} from 'uqr'
import {computed, onBeforeUnmount, ref} from 'vue'
import {copyToClipboard} from '../clipboard'

/**
 * A join code, large and copyable. With `link`, the address that joins with the code directly can
 * be copied too, and `qr` shows it as a QR code. `hidden` keeps the code blurred until it is held
 * down or focused with the keyboard, so it cannot be read along on a shared screen.
 */
const props = defineProps<{
  title: string
  code: string
  link?: string
  qr?: boolean
  hidden?: boolean
}>()

const FEEDBACK_MS = 1500

const revealed = ref(false)
const result = ref<{ what: 'code' | 'link', succeeded: boolean } | null>(null)
const qrImage = computed(() => renderSVG(props.link ?? props.code, {border: 1}))
let timer: ReturnType<typeof setTimeout> | undefined

const message = computed(() => result.value === null
    ? ''
    : result.value.succeeded ? 'Kopiert' : 'Kopieren fehlgeschlagen')

function icon(what: 'code' | 'link', idle: string): string {
  if (result.value?.what !== what) return idle
  return result.value.succeeded ? 'i-lucide-check' : 'i-lucide-x'
}

async function copy(what: 'code' | 'link'): Promise<void> {
  const succeeded = await copyToClipboard(what === 'link' && props.link ? props.link : props.code)
  result.value = {what, succeeded}
  clearTimeout(timer)
  timer = setTimeout(() => {
    result.value = null
  }, FEEDBACK_MS)
}

onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <div class="inline-flex flex-col gap-1">
    <span class="field-label">{{ title }}</span>
    <div class="inline-flex items-center gap-1 rounded-sm border border-default bg-default py-1 pl-3 pr-1">
      <span class="tabular select-all text-lg font-medium transition-[filter]"
            :class="hidden && !revealed ? 'blur-sm' : ''"
            :tabindex="hidden ? 0 : undefined"
            :aria-label="hidden ? `${title}: ${code}` : undefined"
            @pointerdown="revealed = true" @pointerup="revealed = false" @pointerleave="revealed = false"
            @focus="revealed = true" @blur="revealed = false">{{ code }}</span>
      <UTooltip :text="result?.what === 'code' ? message : 'Code kopieren'">
        <UButton :icon="icon('code', 'i-lucide-copy')" color="neutral" variant="ghost" size="sm"
                 :aria-label="`Code ${title} kopieren`" @click="copy('code')"/>
      </UTooltip>
      <UTooltip v-if="link" :text="result?.what === 'link' ? message : 'Link kopieren'">
        <UButton :icon="icon('link', 'i-lucide-link')" color="neutral" variant="ghost" size="sm"
                 :aria-label="`Link für ${title} kopieren`" @click="copy('link')"/>
      </UTooltip>
      <UPopover v-if="qr">
        <UButton icon="i-lucide-qr-code" color="neutral" variant="ghost" size="sm" :aria-label="`QR-Code für ${title}`"/>
        <template #content>
          <div class="size-56 bg-white p-2 text-black [&>svg]:size-full" role="img" :aria-label="`QR-Code für ${title}`"
               v-html="qrImage"/>
        </template>
      </UPopover>
      <span class="sr-only" role="status">{{ message }}</span>
    </div>
  </div>
</template>
