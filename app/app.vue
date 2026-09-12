<template>
  <div>
    <NuxtRouteAnnouncer />
    <!-- <NuxtWelcome /> -->
    <p
      v-if="route.path !== '/jiuyin' && route.path !== '/blog'"
      class="mb"
    >
      请使用电脑访问😋
    </p>
    <NuxtPage
      :class="{
        pc: route.path !== '/jiuyin' && route.path !== '/blog',
      }"
    />
  </div>
</template>
<script setup lang="ts">
  const route = useRoute();
  useHead({
    title: "江苏久引-门户首页",
    link: [
      {
        key: "favicon",
        rel: "icon",
        type: "image/x-icon",
        sizes: "32x32",
        href: "/favicon.ico?v=20260816-2",
      },
      { rel: "stylesheet", href: "/css/public.css" },
      {
        key: "aside-iconfont",
        rel: "stylesheet",
        href: "https://at.alicdn.com/t/c/font_5223671_kfzxhaapicm.css?spm=a313x.manage_type_myprojects.i1.9.7ef13a81X2zkYb&file=font_5223671_kfzxhaapicm.css",
      },
    ],
  });
</script>
