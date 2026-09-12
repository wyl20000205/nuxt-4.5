<!-- ipx报错的问题找到了 跨平台构建了 -->
<template>
  <div id="pages_nuxtImage">
     <p class="mb-10"><em>没使用 NuxtImg:</em><img class="w-auto h-[100px] object-cover" src="/images/bg1.webp" alt=""></p>
     <p><em>使用 NuxtImg:</em><NuxtImg src="/images/bg1.webp" format="webp" quality="60" class="h-[100px] w-auto"/></p>
  </div>
</template>
<script setup lang="ts">
  
</script>

<style lang="less" scoped>
  #pages_nuxtImage{

  }
</style>