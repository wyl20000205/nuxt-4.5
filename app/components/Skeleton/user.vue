<template>
  <section id="skeleton_user" aria-label="正在加载我的帖子" aria-busy="true">
    <span class="sr-only">正在加载我的帖子</span>
    <article v-for="item in 8" :key="item" class="card">
      <div class="head"><span></span><span></span></div>
      <div class="content"></div>
      <div class="foot"><span></span><span></span></div>
    </article>
  </section>
</template>

<style lang="less" scoped>
  #skeleton_user {
    display: grid;
    gap: 14px;

    .card {
      padding: 20px;
      border: 1px solid #dedee2;
      border-radius: 16px;
    }

    .head,
    .foot {
      display: flex;
      justify-content: space-between;
      gap: 16px;
    }

    .head span,
    .foot span,
    .content {
      height: 16px;
      border-radius: 6px;
      background: linear-gradient(100deg, #eeeef0 30%, #f8f8f9 50%, #eeeef0 70%);
      background-size: 220% 100%;
      animation: shimmer 1.35s ease-in-out infinite;
    }

    .head span:first-child { width: 34%; }
    .head span:last-child { width: 24%; }
    .content { width: 72%; margin: 28px 0; }
    .foot { margin-top: 26px; }
    .foot span:first-child { width: 18%; }
    .foot span:last-child { width: 28%; }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
    }

    @keyframes shimmer {
      to { background-position-x: -220%; }
    }

    @media (prefers-reduced-motion: reduce) {
      .head span,
      .foot span,
      .content { animation: none; }
    }
  }
</style>
