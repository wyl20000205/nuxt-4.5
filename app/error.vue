<script setup lang="ts">
  import type { NuxtError } from "#app";

  const props = defineProps<{ error: NuxtError }>();
  console.log("Error component props:", props);
</script>

<template>
  <div>
    <h1>{{ error.status }}</h1>
    <h1>{{ error.message }}</h1>
    <NuxtLink to="/">Go back home</NuxtLink>
  </div>
</template>
