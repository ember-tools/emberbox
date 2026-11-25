<script setup lang="ts">
/** Ein Abbild eines Oberflächenteils in der Hilfe; es lässt sich weder anklicken noch fokussieren. */
defineProps<{ beschriftung: string }>()
</script>

<template>
  <figure class="m-0 flex flex-col gap-1.5">
    <div class="overflow-x-auto rounded-sm border border-dashed border-accented bg-muted">
      <div inert class="pointer-events-none min-w-[36rem] select-none p-3">
        <slot/>
      </div>
    </div>
    <figcaption class="text-xs text-muted">{{ beschriftung }}</figcaption>
  </figure>
</template>
