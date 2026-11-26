<script setup lang="ts">
import {h, type VNode} from 'vue'
import type {SvgElement} from '../symbols/tactical'

/**
 * A tactical symbol drawn into the page as SVG nodes, so the theme's signal red applies to it.
 * The tree comes from `unitSymbolTree` or `markSymbolTree`.
 */
const props = defineProps<{
  /** The symbol to draw. */
  symbol: SvgElement
  /** Width in pixels; the height follows the symbol's aspect ratio. */
  width?: number
}>()

/** Builds the Vue nodes of one element and everything below it. */
function draw(node: SvgElement): VNode {
  return h(node.tag, node.attributes, node.text ?? node.children?.map(draw))
}

/** The symbol as Vue nodes. */
function Drawing(): VNode {
  return draw(props.symbol)
}
</script>

<template>
  <span class="tactical-symbol" :style="{width: `${width ?? 48}px`}"><Drawing/></span>
</template>

<style scoped>
.tactical-symbol {
  display: inline-block;
  line-height: 0;
}

.tactical-symbol :deep(svg) {
  width: 100%;
  height: auto;
}
</style>
