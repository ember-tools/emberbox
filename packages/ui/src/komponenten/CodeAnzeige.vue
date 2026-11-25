<script setup lang="ts">
import UButton from '@nuxt/ui/components/Button.vue'
import UPopover from '@nuxt/ui/components/Popover.vue'
import UTooltip from '@nuxt/ui/components/Tooltip.vue'
import {renderSVG} from 'uqr'
import {computed, onBeforeUnmount, ref} from 'vue'
import {inZwischenablage} from '../zwischenablage'

/**
 * Ein Beitrittscode, groß und kopierbar. Mit `link` lässt sich auch die Adresse kopieren, unter
 * der man mit dem Code direkt beitritt, und mit `qr` als QR-Code zeigen. `verdeckt` hält den Code
 * unscharf, bis er gedrückt gehalten oder per Tastatur fokussiert wird, damit er bei geteiltem
 * Bildschirm nicht mitgelesen wird.
 */
const props = defineProps<{
  titel: string
  code: string
  link?: string
  qr?: boolean
  verdeckt?: boolean
}>()

const ANZEIGE_MS = 1500

const zeigen = ref(false)
const ergebnis = ref<{ was: 'code' | 'link', gelungen: boolean } | null>(null)
const qrBild = computed(() => renderSVG(props.link ?? props.code, {border: 1}))
let zeitgeber: ReturnType<typeof setTimeout> | undefined

const meldung = computed(() => ergebnis.value === null
    ? ''
    : ergebnis.value.gelungen ? 'Kopiert' : 'Kopieren fehlgeschlagen')

function symbol(was: 'code' | 'link', ruhend: string): string {
  if (ergebnis.value?.was !== was) return ruhend
  return ergebnis.value.gelungen ? 'i-lucide-check' : 'i-lucide-x'
}

async function kopieren(was: 'code' | 'link'): Promise<void> {
  const gelungen = await inZwischenablage(was === 'link' && props.link ? props.link : props.code)
  ergebnis.value = {was, gelungen}
  clearTimeout(zeitgeber)
  zeitgeber = setTimeout(() => {
    ergebnis.value = null
  }, ANZEIGE_MS)
}

onBeforeUnmount(() => clearTimeout(zeitgeber))
</script>

<template>
  <div class="inline-flex flex-col gap-1">
    <span class="feld-label">{{ titel }}</span>
    <div class="inline-flex items-center gap-1 rounded-sm border border-default bg-default py-1 pl-3 pr-1">
      <span class="tabular select-all text-lg font-medium transition-[filter]"
            :class="verdeckt && !zeigen ? 'blur-sm' : ''"
            :tabindex="verdeckt ? 0 : undefined"
            :aria-label="verdeckt ? `${titel}: ${code}` : undefined"
            @pointerdown="zeigen = true" @pointerup="zeigen = false" @pointerleave="zeigen = false"
            @focus="zeigen = true" @blur="zeigen = false">{{ code }}</span>
      <UTooltip :text="ergebnis?.was === 'code' ? meldung : 'Code kopieren'">
        <UButton :icon="symbol('code', 'i-lucide-copy')" color="neutral" variant="ghost" size="sm"
                 :aria-label="`Code ${titel} kopieren`" @click="kopieren('code')"/>
      </UTooltip>
      <UTooltip v-if="link" :text="ergebnis?.was === 'link' ? meldung : 'Link kopieren'">
        <UButton :icon="symbol('link', 'i-lucide-link')" color="neutral" variant="ghost" size="sm"
                 :aria-label="`Link für ${titel} kopieren`" @click="kopieren('link')"/>
      </UTooltip>
      <UPopover v-if="qr">
        <UButton icon="i-lucide-qr-code" color="neutral" variant="ghost" size="sm" :aria-label="`QR-Code für ${titel}`"/>
        <template #content>
          <div class="size-56 bg-white p-2 text-black [&>svg]:size-full" role="img" :aria-label="`QR-Code für ${titel}`"
               v-html="qrBild"/>
        </template>
      </UPopover>
      <span class="sr-only" role="status">{{ meldung }}</span>
    </div>
  </div>
</template>
