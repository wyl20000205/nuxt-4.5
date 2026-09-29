<template>
  <main id="components_Skeleton_bibm2026" aria-label="正在加载中稿查询" aria-busy="true">
    <span class="sr-only">正在加载中稿查询</span>
    <nav><i v-for="item in 7" :key="item"></i></nav>
    <section>
      <i class="eyebrow"></i>
      <i class="title"></i>
      <i class="intro"></i>
      <i class="label"></i>
      <i class="input"></i>
      <div class="stats"><i v-for="item in 3" :key="item"></i></div>
      <i class="note"></i>
      <i class="download"></i>
    </section>
  </main>
</template>

<style lang="less" scoped>
  #components_Skeleton_bibm2026 {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 24px;
    background: #f5f7fb;

    nav { width: min(100%, 900px); }
    section { width: min(100%, 600px); }

    nav {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 4px;
      padding: 4px;
      border-radius: 12px;
      background: #e9eef7;
    }

    nav i {
      height: 38px;
    }

    section {
      padding: clamp(24px, 5vw, 44px);
      border: 1px solid #e6eaf1;
      border-radius: 20px;
      background: white;
      box-shadow: 0 18px 55px #14213d0d;
    }

    i {
      display: block;
      border-radius: 8px;
      background: linear-gradient(100deg, #e9edf3 30%, #f7f9fc 50%, #e9edf3 70%);
      background-size: 220% 100%;
      animation: shimmer 1.35s ease-in-out infinite;
    }

    .eyebrow { width: 92px; height: 16px; }
    .title { width: 190px; height: 38px; margin-top: 12px; }
    .intro { width: 270px; max-width: 80%; height: 16px; margin-top: 18px; }
    .label { width: 76px; height: 16px; margin-top: 30px; }
    .input { width: 100%; height: 52px; margin-top: 10px; }
    .stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-top: 32px;
    }
    .stats i { height: 76px; border-radius: 12px; }
    .note { width: 82%; height: 14px; margin-top: 20px; }
    .download { width: 150px; height: 16px; margin-top: 24px; }

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

    @media screen and (max-width: 618px) {
      nav { grid-template-columns: repeat(2, 1fr); }
      .stats { grid-template-columns: repeat(2, 1fr); }
      .stats i:last-child { display: none; }
    }

    @media (prefers-reduced-motion: reduce) {
      i { animation: none; }
    }
  }
</style>
