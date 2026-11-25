<script setup lang="ts">
/** A replica of part of the interface in the help; it can be neither clicked nor focused. */
defineProps<{ caption: string }>()
</script>

<template>
  <figure class="m-0 flex flex-col gap-1.5">
    <div class="overflow-x-auto rounded-sm border border-dashed border-accented bg-muted">
      <div inert class="pointer-events-none min-w-[36rem] select-none p-3">
        <slot/>
      </div>
    </div>
    <figcaption class="text-xs text-muted">{{ caption }}</figcaption>
  </figure>
</template>
