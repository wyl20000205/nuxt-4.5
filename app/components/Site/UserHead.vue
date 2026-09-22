<template>
  <SiteHead title="用户中心" :items="item_nav" @select="emit('select', $event)" />
</template>

<script setup lang="ts">
  import { useUserStore } from "~/stores/user"

  const emit = defineEmits<{ select: [text: string] }>()
  const { item_nav } = storeToRefs(useUserStore())
</script>
