<template>
  <SiteHead  :items="item_nav" @select="emit('select', $event)" />
</template>

<script setup lang="ts">
  import { storeAdmin } from "~/stores/admin"

  const emit = defineEmits<{ select: [text: string] }>()
  const { admin_data } = storeToRefs(storeAdmin())
  const item_nav = computed(() => admin_data.value.item_nav)
</script>
