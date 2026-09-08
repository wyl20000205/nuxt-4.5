<template>
  <main
    class="pc"
    id="pages_demo"
    ref="experienceRoot"
    :class="`chapter-${activeSection + 1}`"
  >
    <div
      v-if="loadingVisible"
      class="experience-loader"
      :class="{ 'is-leaving': loadingLeaving, 'has-error': loadingError }"
      role="status"
      aria-live="polite"
    >
      <div class="loader-grid" aria-hidden="true"></div>
      <div class="loader-content">
        <div class="loader-emblem" aria-hidden="true">
          <i></i><i></i><i></i>
          <span><img src="/images/logo.png" alt="" /></span>
        </div>
        <p>Eng-Link AI 基础设施</p>
        <h1>{{ loadingError ? "正在切换基础视图" : "正在连接 AI 网络" }}</h1>
        <small>{{ loadingStatus }}</small>
        <div class="loader-progress" aria-hidden="true">
          <span><i :style="{ transform: `scaleX(${loadingProgress / 100})` }"></i></span>
          <b>{{ String(Math.round(loadingProgress)).padStart(2, "0") }}%</b>
        </div>
        <div class="loader-meta" aria-hidden="true">
          <span>模型节点</span>
          <span>安全凭证</span>
          <span>智能线路</span>
        </div>
      </div>
    </div>

    <section
      ref="stage"
      class="js-experience experience s1"
      :class="{
        'webgl-ready': webglReady,
        'render-unavailable': renderUnavailable,
      }"
      aria-label="一个密钥，调用主流AI"
    >
      <div
        ref="threeHost"
        class="js-experience-canvas experience__canvas three-stage"
        aria-hidden="true"
      ></div>

      <div class="scene-overlay" aria-hidden="true">
        <div class="scene-grid"></div>
        <div class="scene-vignette"></div>
        <div class="scene-flare flare-violet"></div>
        <div class="scene-flare flare-cyan"></div>
        <div class="cinema-bar cinema-bar-top"></div>
        <div class="cinema-bar cinema-bar-bottom"></div>
      </div>

      <header class="hud-header">
        <div class="brand-lockup">
          <span class="brand-mark"><img src="/images/logo.png" alt="" /></span>
          <span class="brand-name">Eng-Link<span>.com</span></span>
        </div>
        <p class="hud-title">AI 基础设施 / {{ currentChapter.title }}</p>
        <p class="hud-time">录制 <i></i> {{ timeCode }}</p>
      </header>

      <div class="chapter-index" aria-hidden="true">
        <span>{{ String(activeSection + 1).padStart(2, "0") }}</span>
        <i></i>
        <b>{{ currentChapter.short }}</b>
      </div>

      <div class="story-beats">
        <article class="story-beat beat-one">
          <p><span></span>第一章 / 统一密钥</p>
          <h1>一个密钥，<br /><strong>调用主流AI</strong></h1>
          <small>接入一个密钥，即可调用国内多家主流AI模型。</small>
        </article>

        <article class="story-beat beat-two">
          <p>01 / 密钥签发 <span></span></p>
          <h2>一次配置，<br />多家模型<strong>立即可用。</strong></h2>
          <small>统一凭证正在连接国内主流 AI 模型。</small>
        </article>

        <article class="story-beat beat-three">
          <p><span></span>模型能力已连接</p>
          <h2>一个密钥，<br /><strong>连接多种能力。</strong></h2>
          <div class="beat-stats">
            <span><b>01</b>统一密钥</span>
            <span><b>06</b>主流模型</span>
            <span><b>01</b>调用入口</span>
          </div>
        </article>

        <article class="story-beat beat-four">
          <p>统一密钥 / 第一章</p>
          <h2>一个密钥，<br /><strong>调用主流AI</strong></h2>
          <small>接入一个密钥，即可调用国内多家主流AI模型。</small>
          <span class="next-signal">下一章 / 一次接入 <i>→</i></span>
        </article>
      </div>

      <div class="kinetic-type" aria-hidden="true">
        <span class="kinetic-api">接口</span>
        <span class="kinetic-token">令牌</span>
        <span class="kinetic-key">密钥</span>
        <span class="kinetic-model">模型</span>
      </div>

      <div class="interface-overlays" aria-hidden="true">
        <article class="overlay-card overlay-request">
          <div class="overlay-head">
            <span><i></i> 请求 01</span><b>统一密钥</b>
          </div>
          <strong>提交 /v1/对话生成</strong>
          <div class="code-row"><i></i><i></i><i></i></div>
          <small>客户端 01 / 统一鉴权通过</small>
        </article>

        <article class="overlay-card overlay-token">
          <div class="overlay-head">
            <span><i></i> 令牌流</span><b>实时</b>
          </div>
          <strong>{{ tokenCount }}</strong>
          <div class="token-wave">
            <i v-for="bar in 14" :key="bar" :style="{ '--bar': bar }"></i>
          </div>
          <small>多模型用量实时汇总</small>
        </article>

        <article class="overlay-card overlay-error">
          <div class="overlay-head">
            <span><i></i> 路由状态</span><b>已切换</b>
          </div>
          <strong>备用线路已接管</strong>
          <div class="error-route"><span></span><i></i><span></span></div>
          <small>请求继续稳定运行</small>
        </article>
      </div>

      <aside class="telemetry" aria-hidden="true">
        <span>镜头 / 自动</span>
        <span>场景 / {{ String(activeSection + 1).padStart(2, "0") }}</span>
        <span>渲染 / {{ webglReady ? "运行中" : "载入中" }}</span>
        <span>帧率 / 实时</span>
      </aside>

      <footer class="playback-bar">
        <p>
          <span>{{ String(activeSection + 1).padStart(2, "0") }}</span>
          {{ currentChapter.short }}
        </p>
        <div class="playback-track">
          <i :style="{ transform: `scaleX(${chapterProgress})` }"></i
          ><b v-for="mark in 5" :key="mark"></b>
        </div>
        <p class="playback-duration">00:10</p>
      </footer>

      <div class="frame-corners" aria-hidden="true">
        <i></i><i></i><i></i><i></i>
      </div>
    </section>

    <section
      class="chapter s2"
      :class="{ 'is-active': activeSection === 1 }"
      aria-label="一次接入，连接多家AI"
    >
      <div class="chapter-watermark" aria-hidden="true">接入</div>
      <article class="chapter-copy connection-copy">
        <p><span></span>第二章 / 一次接入</p>
        <h2>一次接入，<br /><strong>连接多家AI</strong></h2>
        <small>一次完成接入，无需分别对接不同AI供应商。</small>
      </article>
      <div class="connection-status" aria-hidden="true">
        <span><i></i>统一接口已就绪</span>
        <span><i></i>六家供应商已连接</span>
        <span><i></i>协议适配已完成</span>
      </div>
    </section>

    <section
      class="chapter s3"
      :class="{ 'is-active': activeSection === 2 }"
      aria-label="一个后台，管好密钥账单"
    >
      <div class="chapter-watermark" aria-hidden="true">管理</div>
      <article class="chapter-copy route-copy">
        <p><span></span>第三章 / 统一后台</p>
        <h2>一个后台，<br /><strong>管好密钥账单</strong></h2>
        <small>密钥、账单、线路统一管理，使用更简单稳定。</small>
      </article>
      <div class="route-sequence" aria-hidden="true">
        <span><b>01</b>密钥统一</span><i></i> <span><b>02</b>账单汇总</span
        ><i></i>
        <span><b>03</b>线路监控</span>
      </div>
    </section>

    <section
      class="chapter s4"
      :class="{ 'is-active': activeSection === 3 }"
      aria-label="一个接口，管理全部调用"
    >
      <article class="chapter-copy manage-copy">
        <p><span></span>第四章 / 统一调用</p>
        <h2>一个接口，<br /><strong>管理全部调用</strong></h2>
        <small>智能选路、故障切换、统一计费，全程统一管理。</small>
      </article>
      <div class="manage-metrics" aria-hidden="true">
        <span
          ><small>统一调用</small><b>{{ manageTokens }}</b></span
        >
        <span
          ><small>统一计费</small><b>¥ {{ manageCost }}</b></span
        >
        <span><small>故障切换</small><b>42 ms</b></span>
      </div>
    </section>

    <section
      class="chapter s5"
      :class="{ 'is-active': activeSection === 4 }"
      aria-label="六十秒内，完成首次调用"
    >
      <div class="scale-orbit" aria-hidden="true"><i></i><i></i><i></i></div>
      <article class="chapter-copy scale-copy">
        <p><span></span>第五章 / 快速调用</p>
        <h2>六十秒内，<br /><strong>完成首次调用</strong></h2>
        <small>修改一次接口地址，切换模型只需改一个名称。</small>
      </article>
      <div class="scale-metrics" aria-hidden="true">
        <span><small>首次调用</small><b>00:60</b></span>
        <span><small>接口地址</small><b>修改 1 次</b></span>
        <span><small>切换模型</small><b>更改名称</b></span>
        <span><small>兼容协议</small><b>OpenAI</b></span>
      </div>
    </section>

    <section
      class="chapter s6"
      :class="{ 'is-active': activeSection === 5 }"
      aria-label="常用工具，直接接入使用"
    >
      <article class="brand-finale">
        <div class="final-logo">
          <img src="/images/logo.png" alt="Eng-Link" />
        </div>
        <p>第六章 / 工具兼容</p>
        <h2>常用工具，<br /><strong>直接接入使用</strong></h2>
        <small>主流开发工具和兼容客户端，都能直接接入使用。</small>
        <div class="brand-cta">
          <a href="https://eng-link-ai.com/" target="_blank" rel="noreferrer"
            >进入 Eng-Link</a
          >
          <a
            href="https://eng-link-ai.com/pricing"
            target="_blank"
            rel="noreferrer"
            >查看模型广场</a
          >
        </div>
      </article>
    </section>

    <div
      class="chapter-transition"
      :style="{ opacity: transitionOpacity }"
      aria-hidden="true"
    ></div>
  </main>
</template>

<script setup lang="ts">
  import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";

  const experienceRoot = ref<HTMLElement | null>(null);
  const stage = ref<HTMLElement | null>(null);
  const threeHost = ref<HTMLElement | null>(null);
  const webglReady = ref(false);
  const renderUnavailable = ref(false);
  const loadingVisible = ref(true);
  const loadingLeaving = ref(false);
  const loadingError = ref(false);
  const loadingProgress = ref(4);
  const loadingStatus = ref("正在载入三维引擎");
  const masterProgress = ref(0);
  const activeSection = ref(0);
  const loadingStartedAt = performance.now();
  let lastTick = -1;
  let loadingLeaveTimer: number | undefined;
  let loadingRemoveTimer: number | undefined;
  let disposeScene: (() => void) | undefined;

  const chapters = [
    { title: "第一章", short: "统一密钥" },
    { title: "第二章", short: "一次接入" },
    { title: "第三章", short: "统一后台" },
    { title: "第四章", short: "统一调用" },
    { title: "第五章", short: "快速调用" },
    { title: "第六章", short: "工具兼容" },
  ];

  const currentChapter = computed(() => chapters[activeSection.value]);
  const chapterProgress = computed(() => {
    const chapterTime = masterProgress.value * chapters.length;
    return chapterTime - Math.floor(chapterTime);
  });
  const transitionOpacity = computed(() => {
    const progress = chapterProgress.value;
    const edge =
      progress < 0.065
        ? 1 - progress / 0.065
        : progress > 0.935
          ? (progress - 0.935) / 0.065
          : 0;
    const clamped = Math.min(1, Math.max(0, edge));
    return (clamped * clamped * (3 - 2 * clamped) * 0.94).toFixed(3);
  });

  const timeCode = computed(() => {
    const seconds = chapterProgress.value * 10;
    return `00:${seconds.toFixed(1).padStart(4, "0")}`;
  });

  const tokenCount = computed(() =>
    Math.floor(2048 + chapterProgress.value * 16444).toLocaleString("zh-CN"),
  );

  const manageTokens = computed(() =>
    Math.floor(840000 + chapterProgress.value * 4268912).toLocaleString(
      "zh-CN",
    ),
  );
  const manageCost = computed(() =>
    (186.4 + chapterProgress.value * 728.32).toFixed(2),
  );

  const restartOverlayTimeline = async () => {
    const element = stage.value;
    if (!element) return;
    element.classList.remove("is-playing");
    void element.offsetWidth;
    await nextTick();
    requestAnimationFrame(() => element.classList.add("is-playing"));
  };

  const finishLoading = async (failed = false) => {
    loadingError.value = failed;
    loadingProgress.value = 100;
    loadingStatus.value = failed ? "三维渲染不可用，正在显示基础内容" : "连接完成";
    webglReady.value = !failed;
    await restartOverlayTimeline();

    const elapsed = performance.now() - loadingStartedAt;
    const remaining = Math.max(160, 900 - elapsed);
    loadingLeaveTimer = window.setTimeout(() => {
      loadingLeaving.value = true;
      loadingRemoveTimer = window.setTimeout(() => {
        loadingVisible.value = false;
      }, 850);
    }, remaining);
  };

  onMounted(async () => {
    const host = threeHost.value;
    if (!host) return;

    const sceneModule = await import("../utils/fragmented-three").catch(
      () => null,
    );
    if (!sceneModule || !host.isConnected) {
      renderUnavailable.value = true;
      await finishLoading(true);
      return;
    }

    loadingProgress.value = Math.max(loadingProgress.value, 16);
    loadingStatus.value = "正在创建三维场景";

    try {
      disposeScene = sceneModule.initFragmentedScene(host, {
        duration: 60,
        chapters: chapters.length,
        onLoop: restartOverlayTimeline,
        onProgress: (progress) => {
          const tick = Math.min(599, Math.floor(progress * 600));
          if (tick === lastTick) return;
          lastTick = tick;
          masterProgress.value = progress;
          activeSection.value = Math.min(
            chapters.length - 1,
            Math.floor(progress * chapters.length),
          );
        },
        onLoadProgress: (progress) => {
          loadingProgress.value = Math.max(
            loadingProgress.value,
            18 + progress * 76,
          );
          loadingStatus.value =
            progress < 0.45
              ? "正在载入模型与品牌纹理"
              : progress < 1
                ? "正在建立数据节点"
                : "正在等待首帧渲染";
        },
        onReady: () => {
          void finishLoading();
        },
      });
    } catch {
      renderUnavailable.value = true;
      await finishLoading(true);
    }
  });

  onBeforeUnmount(() => {
    if (loadingLeaveTimer !== undefined) window.clearTimeout(loadingLeaveTimer);
    if (loadingRemoveTimer !== undefined) window.clearTimeout(loadingRemoveTimer);
    disposeScene?.();
  });

  useHead({
    title: "一个密钥，调用主流AI · Eng-Link",
    meta: [{ name: "theme-color", content: "#030409" }],
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
        href: "https://at.alicdn.com/t/c/font_5223671_ed99vu0wvvj.css?spm=a313x.manage_type_myprojects.i1.9.6a243a81i54xFu&file=font_5223671_ed99vu0wvvj.css",
      },
    ],
  });
</script>

<style scoped lang="less">
  #pages_demo {
    box-sizing: border-box;
    color: #f6f7fb;
    background: #030409;
    font-family:
      Inter,
      ui-sans-serif,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      "PingFang SC",
      "Microsoft YaHei",
      sans-serif;
    -webkit-font-smoothing: antialiased;

    *,
    *::before,
    *::after {
      box-sizing: inherit;
    }
  }

  #pages_demo,
  #pages_demo .s1 {
    width: 100%;
    height: 100vh;
    min-height: 600px;
    overflow: hidden;
  }

  #pages_demo {
    position: relative;
    background: #030409;
  }

  .experience-loader {
    position: absolute;
    z-index: 1000;
    inset: 0;
    display: grid;
    place-items: center;
    overflow: hidden;
    background:
      radial-gradient(
        circle at 50% 46%,
        rgba(86, 65, 180, 0.16),
        transparent 31%
      ),
      radial-gradient(
        circle at 30% 78%,
        rgba(35, 150, 188, 0.07),
        transparent 28%
      ),
      #030409;
    opacity: 1;
    transition:
      opacity 0.82s cubic-bezier(0.22, 1, 0.36, 1),
      filter 0.82s ease;
  }

  .experience-loader.is-leaving {
    opacity: 0;
    filter: blur(10px);
    pointer-events: none;
  }

  .loader-grid {
    position: absolute;
    inset: -12%;
    opacity: 0.24;
    background-image:
      linear-gradient(rgba(145, 133, 232, 0.055) 1px, transparent 1px),
      linear-gradient(90deg, rgba(145, 133, 232, 0.055) 1px, transparent 1px);
    background-size: 72px 72px;
    mask-image: radial-gradient(circle at center, #000 5%, transparent 68%);
    animation: loader-grid-drift 8s linear infinite;
  }

  .loader-content {
    position: relative;
    z-index: 2;
    width: min(520px, calc(100vw - 56px));
    text-align: center;
    transition:
      opacity 0.7s ease,
      transform 0.9s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .is-leaving .loader-content {
    opacity: 0;
    transform: scale(1.08) translateY(-16px);
  }

  .loader-emblem {
    position: relative;
    display: grid;
    place-items: center;
    width: 112px;
    height: 112px;
    margin: 0 auto 34px;
  }

  .loader-emblem > i {
    position: absolute;
    width: 100%;
    height: 100%;
    border: 1px solid rgba(142, 123, 255, 0.22);
    border-radius: 50%;
    animation: loader-orbit 3.8s linear infinite;
  }

  .loader-emblem > i::after {
    position: absolute;
    top: -3px;
    left: 50%;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #8f7cff;
    box-shadow: 0 0 16px rgba(143, 124, 255, 0.8);
    content: "";
  }

  .loader-emblem > i:nth-child(2) {
    width: 82px;
    height: 82px;
    border-color: rgba(83, 217, 255, 0.17);
    animation-duration: 2.9s;
    animation-direction: reverse;
  }

  .loader-emblem > i:nth-child(2)::after {
    background: #53d9ff;
    box-shadow: 0 0 15px rgba(83, 217, 255, 0.72);
  }

  .loader-emblem > i:nth-child(3) {
    width: 137px;
    height: 62px;
    border-color: rgba(178, 184, 219, 0.1);
    animation-duration: 5.4s;
    animation-direction: reverse;
  }

  .loader-emblem > i:nth-child(3)::after {
    width: 4px;
    height: 4px;
    background: rgba(220, 224, 242, 0.72);
    box-shadow: 0 0 12px rgba(220, 224, 242, 0.55);
  }

  .loader-emblem > span {
    position: relative;
    z-index: 2;
    display: grid;
    place-items: center;
    width: 54px;
    height: 54px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 17px;
    background: rgba(239, 240, 246, 0.92);
    box-shadow:
      0 0 0 9px rgba(125, 98, 255, 0.045),
      0 0 48px rgba(106, 81, 225, 0.2);
  }

  .loader-emblem img {
    width: 39px;
    height: 39px;
    object-fit: contain;
  }

  .loader-content > p {
    margin: 0 0 13px;
    color: #9583ff;
    font-size: 9px;
    font-weight: 760;
    letter-spacing: 0.22em;
    text-transform: uppercase;
  }

  .loader-content > h1 {
    margin: 0;
    color: rgba(246, 247, 252, 0.94);
    font-size: clamp(30px, 3.2vw, 48px);
    font-weight: 470;
    letter-spacing: -0.035em;
  }

  .loader-content > small {
    display: block;
    min-height: 20px;
    margin-top: 13px;
    color: rgba(176, 182, 211, 0.42);
    font-size: 10px;
    letter-spacing: 0.09em;
  }

  .loader-progress {
    display: grid;
    grid-template-columns: 1fr 42px;
    align-items: center;
    gap: 16px;
    margin-top: 34px;
  }

  .loader-progress > span {
    position: relative;
    height: 2px;
    overflow: hidden;
    background: rgba(181, 187, 219, 0.1);
  }

  .loader-progress > span > i {
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, #7560ff, #55d9ff);
    box-shadow: 0 0 13px rgba(83, 217, 255, 0.46);
    transform: scaleX(0);
    transform-origin: left center;
    transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .loader-progress > b {
    color: rgba(224, 227, 240, 0.64);
    font: 600 11px/1 ui-monospace, SFMono-Regular, Consolas, monospace;
    text-align: right;
  }

  .loader-meta {
    display: flex;
    justify-content: center;
    gap: 26px;
    margin-top: 18px;
  }

  .loader-meta span {
    position: relative;
    color: rgba(149, 157, 190, 0.26);
    font-size: 8px;
    letter-spacing: 0.12em;
  }

  .loader-meta span::before {
    display: inline-block;
    width: 4px;
    height: 4px;
    margin-right: 7px;
    border-radius: 50%;
    background: #63d9ff;
    box-shadow: 0 0 8px rgba(99, 217, 255, 0.5);
    content: "";
    vertical-align: 1px;
  }

  .experience-loader.has-error .loader-progress > span > i {
    background: linear-gradient(90deg, #8c76ff, #ff9a69);
  }

  @keyframes loader-orbit {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes loader-grid-drift {
    to {
      transform: translate3d(72px, 72px, 0);
    }
  }

  .s1 {
    position: relative;
    isolation: isolate;
    perspective: 1200px;
    background:
      radial-gradient(
        circle at 73% 43%,
        rgba(76, 54, 170, 0.2),
        transparent 32%
      ),
      radial-gradient(
        circle at 24% 70%,
        rgba(21, 127, 173, 0.12),
        transparent 28%
      ),
      #030409;
  }

  .three-stage {
    position: absolute;
    z-index: 1;
    inset: 0;
    overflow: hidden;
    opacity: 0;
    transform: scale(1.04);
    transition:
      opacity 0.8s ease,
      transform 1.3s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .webgl-ready .three-stage {
    opacity: 1;
    transform: scale(1);
  }
  .three-stage :deep(.fragmented-webgl) {
    display: block;
    width: 100%;
    height: 100%;
  }

  .render-unavailable .three-stage::after {
    position: absolute;
    top: 50%;
    left: 50%;
    color: rgba(183, 187, 213, 0.4);
    font:
      600 10px/1.5 ui-monospace,
      SFMono-Regular,
      Consolas,
      monospace;
    letter-spacing: 0.12em;
    content: "三维渲染器不可用";
    transform: translate(-50%, -50%);
  }

  .scene-overlay,
  .scene-grid,
  .scene-vignette {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .scene-overlay {
    z-index: 2;
  }
  .scene-grid {
    opacity: 0.36;
    background-image:
      linear-gradient(rgba(154, 159, 194, 0.035) 1px, transparent 1px),
      linear-gradient(90deg, rgba(154, 159, 194, 0.035) 1px, transparent 1px);
    background-size: 76px 76px;
    mask-image: radial-gradient(
      ellipse at center,
      #000,
      rgba(0, 0, 0, 0.68) 48%,
      transparent 88%
    );
    -webkit-mask-image: radial-gradient(
      ellipse at center,
      #000,
      rgba(0, 0, 0, 0.68) 48%,
      transparent 88%
    );
  }

  .scene-vignette {
    z-index: 3;
    background:
      linear-gradient(
        90deg,
        rgba(2, 3, 7, 0.47),
        transparent 28%,
        transparent 74%,
        rgba(2, 3, 7, 0.28)
      ),
      radial-gradient(
        ellipse at center,
        transparent 42%,
        rgba(1, 2, 5, 0.66) 100%
      );
  }

  .scene-flare {
    position: absolute;
    width: 42vw;
    height: 42vw;
    border-radius: 50%;
    opacity: 0;
    filter: blur(90px);
    mix-blend-mode: screen;
  }

  .flare-violet {
    top: -22%;
    right: -8%;
    background: rgba(104, 76, 255, 0.2);
  }
  .flare-cyan {
    right: 35%;
    bottom: -30%;
    background: rgba(46, 202, 255, 0.12);
  }

  .cinema-bar {
    position: absolute;
    right: 0;
    left: 0;
    z-index: 20;
    height: 14px;
    background: #010205;
  }
  .cinema-bar-top {
    top: 0;
  }
  .cinema-bar-bottom {
    bottom: 0;
  }

  .hud-header {
    position: absolute;
    top: 14px;
    right: 0;
    left: 0;
    z-index: 20;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    width: min(1460px, calc(100% - 94px));
    height: 64px;
    margin: 0 auto;
    border-bottom: 1px solid rgba(187, 191, 218, 0.11);
  }

  .brand-lockup {
    display: inline-flex;
    align-items: center;
    gap: 10px;
  }
  .brand-mark {
    display: grid;
    place-items: center;
    width: 29px;
    height: 29px;
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 9px;
    background: rgba(255, 255, 255, 0.94);
    box-shadow: 0 0 24px rgba(139, 123, 255, 0.16);
  }
  .brand-mark img {
    width: 21px;
    height: 21px;
    object-fit: contain;
  }
  .brand-name {
    color: rgba(248, 248, 253, 0.92);
    font-size: 15px;
    font-weight: 760;
    letter-spacing: -0.03em;
  }
  .brand-name span {
    color: #8d7bff;
  }
  .hud-title {
    margin: 0;
    color: rgba(182, 186, 211, 0.32);
    font:
      650 8px/1 ui-monospace,
      SFMono-Regular,
      Consolas,
      monospace;
    letter-spacing: 0.18em;
  }
  .hud-time {
    display: flex;
    align-items: center;
    justify-self: end;
    gap: 7px;
    margin: 0;
    color: rgba(188, 192, 216, 0.36);
    font:
      600 8px/1 ui-monospace,
      SFMono-Regular,
      Consolas,
      monospace;
    letter-spacing: 0.12em;
  }
  .hud-time i {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #ff4d6d;
    box-shadow: 0 0 10px #ff4d6d;
    animation: rec-pulse 1s ease-in-out infinite;
  }

  .chapter-index {
    position: absolute;
    top: 50%;
    left: 35px;
    z-index: 20;
    display: flex;
    align-items: center;
    gap: 11px;
    color: rgba(180, 184, 210, 0.24);
    font:
      700 7px/1 ui-monospace,
      SFMono-Regular,
      Consolas,
      monospace;
    letter-spacing: 0.16em;
    transform: translateY(-50%) rotate(-90deg);
    transform-origin: left center;
  }
  .chapter-index span {
    color: #9180ff;
  }
  .chapter-index i {
    width: 54px;
    height: 1px;
    background: linear-gradient(90deg, #8875ff, rgba(136, 117, 255, 0.08));
  }
  .chapter-index b {
    font-weight: 650;
  }

  .story-beats {
    position: absolute;
    z-index: 12;
    inset: 0;
    pointer-events: none;
  }

  .story-beat {
    position: absolute;
    opacity: 0;
    will-change: opacity, transform, filter;
  }

  .story-beat p {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0 0 23px;
    color: #9382ff;
    font-size: 9px;
    font-weight: 760;
    letter-spacing: 0.19em;
  }
  .story-beat p span {
    width: 27px;
    height: 1px;
    background: #8b79ff;
    box-shadow: 0 0 12px rgba(139, 121, 255, 0.7);
  }
  .story-beat h1,
  .story-beat h2 {
    margin: 0;
    color: #f5f6fb;
    font-weight: 480;
    line-height: 1.03;
    letter-spacing: -0.045em;
    text-shadow: 0 22px 70px rgba(0, 0, 0, 0.32);
  }
  .story-beat h1 {
    font-size: clamp(62px, 7.2vw, 124px);
  }
  .story-beat h2 {
    font-size: clamp(48px, 5.8vw, 98px);
  }
  .story-beat h1 strong,
  .story-beat h2 strong {
    color: #9685ff;
    font-weight: 480;
    text-shadow: 0 0 42px rgba(111, 86, 255, 0.22);
  }
  .story-beat small {
    display: block;
    margin-top: 26px;
    color: rgba(192, 196, 218, 0.48);
    font-size: clamp(12px, 1.08vw, 16px);
    line-height: 1.7;
    letter-spacing: 0.025em;
  }

  .beat-one {
    top: 25%;
    left: clamp(86px, 8.5vw, 164px);
    width: 56vw;
  }
  .beat-two {
    top: 26%;
    right: clamp(76px, 7.5vw, 146px);
    width: 62vw;
    text-align: right;
  }
  .beat-two p {
    justify-content: flex-end;
  }
  .beat-two small {
    margin-left: auto;
    max-width: 520px;
  }
  .beat-three {
    top: 25%;
    left: clamp(86px, 8.5vw, 164px);
    width: 69vw;
  }
  .beat-four {
    top: 50%;
    left: 50%;
    width: min(900px, 80vw);
    text-align: center;
    transform: translate(-50%, -50%);
  }
  .beat-four p {
    display: block;
    margin-bottom: 20px;
  }
  .beat-four small {
    color: rgba(197, 201, 221, 0.46);
  }

  .beat-stats {
    display: flex;
    gap: 0;
    margin-top: 38px;
  }
  .beat-stats span {
    min-width: 128px;
    padding: 0 25px;
    border-left: 1px solid rgba(190, 193, 217, 0.14);
    color: rgba(180, 184, 208, 0.34);
    font:
      700 7px/1.4 ui-monospace,
      SFMono-Regular,
      Consolas,
      monospace;
    letter-spacing: 0.14em;
  }
  .beat-stats span:first-child {
    padding-left: 0;
    border-left: 0;
  }
  .beat-stats b {
    display: block;
    margin-bottom: 8px;
    color: rgba(244, 245, 251, 0.86);
    font-size: 21px;
    font-weight: 520;
  }
  .next-signal {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    margin-top: 34px;
    padding: 8px 13px;
    border: 1px solid rgba(143, 127, 255, 0.2);
    border-radius: 999px;
    color: rgba(164, 153, 255, 0.62);
    background: rgba(92, 71, 208, 0.06);
    font:
      700 7px/1 ui-monospace,
      SFMono-Regular,
      Consolas,
      monospace;
    letter-spacing: 0.14em;
  }
  .next-signal i {
    font-style: normal;
  }

  .kinetic-type {
    position: absolute;
    z-index: 4;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
  }
  .kinetic-type span {
    position: absolute;
    color: transparent;
    font-size: clamp(140px, 23vw, 420px);
    font-weight: 850;
    line-height: 0.8;
    letter-spacing: -0.09em;
    opacity: 0;
    -webkit-text-stroke: 1px rgba(161, 153, 230, 0.18);
    will-change: transform, opacity, filter;
  }
  .kinetic-api {
    top: 17%;
    right: -6%;
  }
  .kinetic-token {
    bottom: 5%;
    left: -10%;
  }
  .kinetic-key {
    top: 14%;
    left: 18%;
  }
  .kinetic-model {
    right: -12%;
    bottom: 3%;
  }

  .interface-overlays {
    position: absolute;
    z-index: 13;
    inset: 0;
    pointer-events: none;
  }
  .overlay-card {
    position: absolute;
    width: 270px;
    padding: 14px 15px 13px;
    border: 1px solid rgba(185, 190, 221, 0.14);
    border-radius: 14px;
    background: linear-gradient(
      145deg,
      rgba(22, 24, 37, 0.82),
      rgba(7, 9, 15, 0.65)
    );
    box-shadow:
      0 20px 65px rgba(0, 0, 0, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.04);
    backdrop-filter: blur(17px);
    opacity: 0;
    will-change: opacity, transform, filter;
  }
  .overlay-request {
    bottom: 16%;
    left: 7%;
  }
  .overlay-token {
    top: 18%;
    right: 8%;
    width: 230px;
  }
  .overlay-error {
    right: 9%;
    bottom: 15%;
    width: 248px;
  }
  .overlay-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: rgba(172, 177, 207, 0.4);
    font:
      700 6px/1 ui-monospace,
      SFMono-Regular,
      Consolas,
      monospace;
    letter-spacing: 0.12em;
  }
  .overlay-head span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .overlay-head i {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #8977ff;
    box-shadow: 0 0 8px #8977ff;
  }
  .overlay-head b {
    color: rgba(151, 138, 255, 0.56);
    font-size: 6px;
  }
  .overlay-card > strong {
    display: block;
    margin-top: 15px;
    color: rgba(244, 245, 251, 0.82);
    font:
      560 11px/1.2 ui-monospace,
      SFMono-Regular,
      Consolas,
      monospace;
  }
  .overlay-token > strong {
    color: #64d8ff;
    font-size: 24px;
  }
  .overlay-error > strong {
    color: rgba(255, 111, 138, 0.8);
  }
  .overlay-card > small {
    display: block;
    margin-top: 11px;
    color: rgba(170, 175, 203, 0.28);
    font:
      650 6px/1 ui-monospace,
      SFMono-Regular,
      Consolas,
      monospace;
    letter-spacing: 0.11em;
  }
  .code-row {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-top: 13px;
  }
  .code-row i {
    width: 86%;
    height: 2px;
    border-radius: 4px;
    background: rgba(137, 119, 255, 0.18);
  }
  .code-row i:nth-child(2) {
    width: 61%;
    background: rgba(83, 213, 255, 0.17);
  }
  .code-row i:nth-child(3) {
    width: 74%;
  }
  .token-wave {
    display: flex;
    align-items: end;
    gap: 3px;
    height: 24px;
    margin-top: 10px;
  }
  .token-wave i {
    width: 5px;
    height: calc(4px + var(--bar) * 1.1px);
    border-radius: 2px;
    background: linear-gradient(#59d8ff, rgba(112, 91, 255, 0.3));
    animation: wave 0.8s ease-in-out infinite alternate;
    animation-delay: calc(var(--bar) * -0.05s);
  }
  .error-route {
    display: grid;
    grid-template-columns: 1fr 12px 1fr;
    align-items: center;
    gap: 6px;
    margin-top: 15px;
  }
  .error-route span {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 91, 124, 0.55));
  }
  .error-route span:last-child {
    background: linear-gradient(90deg, rgba(255, 91, 124, 0.55), transparent);
  }
  .error-route i {
    position: relative;
    width: 12px;
    height: 12px;
  }
  .error-route i::before,
  .error-route i::after {
    position: absolute;
    top: 5px;
    left: 0;
    width: 12px;
    height: 1px;
    background: #ff5b7c;
    box-shadow: 0 0 8px #ff5b7c;
    content: "";
    transform: rotate(45deg);
  }
  .error-route i::after {
    transform: rotate(-45deg);
  }

  .telemetry {
    position: absolute;
    top: 50%;
    right: 27px;
    z-index: 20;
    display: flex;
    flex-direction: column;
    gap: 14px;
    color: rgba(177, 181, 207, 0.22);
    font:
      650 6px/1 ui-monospace,
      SFMono-Regular,
      Consolas,
      monospace;
    letter-spacing: 0.13em;
    transform: translateY(-50%);
  }

  .playback-bar {
    position: absolute;
    right: 48px;
    bottom: 29px;
    left: 48px;
    z-index: 20;
    display: grid;
    grid-template-columns: 150px 1fr 46px;
    align-items: center;
    gap: 18px;
  }
  .playback-bar p {
    margin: 0;
    color: rgba(179, 183, 208, 0.3);
    font:
      650 7px/1 ui-monospace,
      SFMono-Regular,
      Consolas,
      monospace;
    letter-spacing: 0.12em;
  }
  .playback-bar p span {
    margin-right: 8px;
    color: #8f7dff;
  }
  .playback-duration {
    text-align: right;
  }
  .playback-track {
    position: relative;
    height: 1px;
    background: rgba(184, 188, 213, 0.12);
  }
  .playback-track > i {
    position: absolute;
    inset: 0;
    display: block;
    background: linear-gradient(90deg, #755fff, #a291ff 55%, #52d5ff);
    box-shadow: 0 0 11px rgba(119, 101, 255, 0.55);
    transform: scaleX(0);
    transform-origin: left;
  }
  .playback-track b {
    position: absolute;
    top: -2px;
    width: 1px;
    height: 5px;
    background: rgba(209, 211, 228, 0.18);
  }
  .playback-track b:nth-of-type(1) {
    left: 20%;
  }
  .playback-track b:nth-of-type(2) {
    left: 40%;
  }
  .playback-track b:nth-of-type(3) {
    left: 60%;
  }
  .playback-track b:nth-of-type(4) {
    left: 80%;
  }
  .playback-track b:nth-of-type(5) {
    left: 100%;
  }

  .frame-corners i {
    position: absolute;
    z-index: 21;
    width: 21px;
    height: 21px;
    opacity: 0.25;
    pointer-events: none;
  }
  .frame-corners i:nth-child(1) {
    top: 94px;
    left: 28px;
    border-top: 1px solid #9b8cff;
    border-left: 1px solid #9b8cff;
  }
  .frame-corners i:nth-child(2) {
    top: 94px;
    right: 28px;
    border-top: 1px solid #9b8cff;
    border-right: 1px solid #9b8cff;
  }
  .frame-corners i:nth-child(3) {
    right: 28px;
    bottom: 58px;
    border-right: 1px solid #62d7ff;
    border-bottom: 1px solid #62d7ff;
  }
  .frame-corners i:nth-child(4) {
    bottom: 58px;
    left: 28px;
    border-bottom: 1px solid #62d7ff;
    border-left: 1px solid #62d7ff;
  }

  .chapter {
    position: absolute;
    z-index: 11;
    inset: 0;
    overflow: hidden;
    visibility: hidden;
    pointer-events: none;
  }
  .chapter.is-active {
    visibility: visible;
  }

  .chapter-transition {
    position: absolute;
    z-index: 30;
    inset: 0;
    background:
      radial-gradient(
        circle at 50% 50%,
        rgba(32, 23, 78, 0.7),
        rgba(3, 4, 9, 0.96) 62%
      ),
      #030409;
    backdrop-filter: blur(10px);
    pointer-events: none;
    transition: opacity 0.16s linear;
    will-change: opacity;
  }

  .chapter-copy {
    position: absolute;
    z-index: 12;
    width: min(760px, 68vw);
    opacity: 0;
    will-change: transform, opacity, filter;
  }
  .chapter-copy p {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0 0 22px;
    color: #9382ff;
    font-size: 9px;
    font-weight: 760;
    letter-spacing: 0.18em;
  }
  .chapter-copy p span {
    width: 28px;
    height: 1px;
    background: #8b79ff;
    box-shadow: 0 0 12px rgba(139, 121, 255, 0.7);
  }
  .chapter-copy h2 {
    margin: 0;
    color: #f5f6fb;
    font-size: clamp(48px, 5.8vw, 98px);
    font-weight: 480;
    line-height: 1.04;
    letter-spacing: -0.045em;
    text-shadow: 0 22px 70px rgba(0, 0, 0, 0.36);
  }
  .chapter-copy h2 strong {
    color: #9685ff;
    font-weight: 480;
    text-shadow: 0 0 42px rgba(111, 86, 255, 0.3);
  }
  .chapter-copy small {
    display: block;
    max-width: 580px;
    margin-top: 25px;
    color: rgba(198, 202, 224, 0.5);
    font-size: clamp(12px, 1.08vw, 16px);
    line-height: 1.8;
  }
  .connection-copy {
    top: 24%;
    left: clamp(86px, 8.5vw, 164px);
  }
  .route-copy {
    top: 24%;
    right: clamp(86px, 8.5vw, 164px);
    text-align: right;
  }
  .route-copy p {
    justify-content: flex-end;
  }
  .route-copy small {
    margin-left: auto;
  }
  .manage-copy {
    top: 20%;
    left: clamp(72px, 7vw, 136px);
    width: min(780px, 62vw);
  }
  .scale-copy {
    top: 20%;
    left: 50%;
    width: min(980px, 78vw);
    text-align: center;
    transform: translateX(-50%);
  }
  .scale-copy p {
    justify-content: center;
  }
  .scale-copy small {
    margin-right: auto;
    margin-left: auto;
  }

  .chapter-watermark {
    position: absolute;
    z-index: 3;
    color: transparent;
    font-size: clamp(210px, 34vw, 620px);
    font-weight: 850;
    line-height: 0.8;
    letter-spacing: -0.1em;
    opacity: 0;
    -webkit-text-stroke: 1px rgba(153, 142, 244, 0.12);
    will-change: transform, opacity, filter;
  }
  .s2 .chapter-watermark {
    right: -7vw;
    bottom: -4vh;
  }
  .s3 .chapter-watermark {
    top: 17vh;
    left: -5vw;
  }

  .connection-status {
    position: absolute;
    right: 7vw;
    bottom: 14vh;
    z-index: 13;
    display: grid;
    gap: 11px;
    width: 260px;
    padding: 18px;
    border: 1px solid rgba(180, 185, 218, 0.13);
    border-radius: 15px;
    background: rgba(8, 10, 18, 0.56);
    backdrop-filter: blur(18px);
    opacity: 0;
  }
  .connection-status span {
    display: flex;
    align-items: center;
    gap: 9px;
    color: rgba(205, 209, 230, 0.52);
    font-size: 9px;
    letter-spacing: 0.08em;
  }
  .connection-status i {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #62ddff;
    box-shadow: 0 0 12px #62ddff;
  }

  .route-sequence {
    position: absolute;
    right: 9vw;
    bottom: 13vh;
    z-index: 13;
    display: flex;
    align-items: center;
    gap: 12px;
    opacity: 0;
  }
  .route-sequence span {
    min-width: 96px;
    color: rgba(200, 204, 226, 0.48);
    font-size: 9px;
    letter-spacing: 0.08em;
  }
  .route-sequence b {
    display: block;
    margin-bottom: 8px;
    color: #9583ff;
    font:
      700 8px/1 ui-monospace,
      Consolas,
      monospace;
  }
  .route-sequence > i {
    width: 42px;
    height: 1px;
    background: linear-gradient(90deg, #7d68ff, #55d9ff);
    box-shadow: 0 0 9px rgba(83, 216, 255, 0.5);
  }

  .manage-metrics {
    position: absolute;
    right: 7vw;
    bottom: 12vh;
    z-index: 13;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    width: min(640px, 54vw);
    border: 1px solid rgba(183, 188, 220, 0.13);
    border-radius: 17px;
    background: rgba(7, 9, 16, 0.58);
    backdrop-filter: blur(19px);
    opacity: 0;
  }
  .manage-metrics span {
    padding: 18px 21px;
    border-left: 1px solid rgba(184, 189, 219, 0.1);
  }
  .manage-metrics span:first-child {
    border-left: 0;
  }
  .manage-metrics small {
    display: block;
    margin-bottom: 9px;
    color: rgba(178, 183, 211, 0.35);
    font-size: 8px;
    letter-spacing: 0.12em;
  }
  .manage-metrics b {
    color: rgba(247, 248, 253, 0.88);
    font-size: clamp(16px, 1.7vw, 28px);
    font-weight: 520;
  }

  .scale-metrics {
    position: absolute;
    right: 5vw;
    bottom: 11vh;
    left: 5vw;
    z-index: 13;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    border-top: 1px solid rgba(187, 191, 220, 0.13);
    border-bottom: 1px solid rgba(187, 191, 220, 0.13);
    opacity: 0;
  }
  .scale-metrics span {
    padding: 18px 2.5vw;
    border-left: 1px solid rgba(187, 191, 220, 0.1);
  }
  .scale-metrics span:first-child {
    border-left: 0;
  }
  .scale-metrics small {
    display: block;
    margin-bottom: 10px;
    color: rgba(178, 183, 211, 0.36);
    font-size: 8px;
    letter-spacing: 0.13em;
  }
  .scale-metrics b {
    color: #f3f4fa;
    font:
      500 clamp(21px, 2.4vw, 40px)/1 ui-monospace,
      Consolas,
      monospace;
  }
  .scale-metrics span:last-child b {
    color: #61dcff;
  }

  .scale-orbit {
    position: absolute;
    z-index: 3;
    inset: 0;
    display: grid;
    place-items: center;
    opacity: 0;
  }
  .scale-orbit i {
    position: absolute;
    width: 42vw;
    height: 42vw;
    border: 1px solid rgba(139, 122, 255, 0.12);
    border-radius: 50%;
  }
  .scale-orbit i:nth-child(2) {
    width: 58vw;
    height: 58vw;
    border-color: rgba(74, 213, 255, 0.08);
  }
  .scale-orbit i:nth-child(3) {
    width: 76vw;
    height: 76vw;
    border-style: dashed;
  }

  .brand-finale {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 14;
    width: min(900px, 84vw);
    text-align: center;
    opacity: 0;
    transform: translate(-50%, -50%);
  }
  .final-logo {
    display: grid;
    place-items: center;
    width: 82px;
    height: 82px;
    margin: 0 auto 30px;
    border: 1px solid rgba(255, 255, 255, 0.22);
    border-radius: 24px;
    background: rgba(255, 255, 255, 0.96);
    box-shadow:
      0 0 0 11px rgba(139, 121, 255, 0.06),
      0 0 90px rgba(117, 92, 255, 0.42);
  }
  .final-logo img {
    width: 59px;
    height: 59px;
    object-fit: contain;
  }
  .brand-finale p {
    margin: 0 0 19px;
    color: #9685ff;
    font-size: 9px;
    font-weight: 760;
    letter-spacing: 0.18em;
  }
  .brand-finale h2 {
    margin: 0;
    color: #f7f8fc;
    font-size: clamp(50px, 6.2vw, 104px);
    font-weight: 470;
    line-height: 1.04;
    letter-spacing: -0.05em;
  }
  .brand-finale h2 strong {
    color: #9a89ff;
    font-weight: 470;
    text-shadow: 0 0 50px rgba(125, 98, 255, 0.35);
  }
  .brand-finale > small {
    display: block;
    margin-top: 24px;
    color: rgba(205, 209, 227, 0.5);
    font-size: 14px;
    letter-spacing: 0.06em;
  }
  .brand-cta {
    display: flex;
    justify-content: center;
    gap: 12px;
    margin-top: 34px;
    pointer-events: auto;
  }
  .brand-cta a {
    padding: 13px 21px;
    border: 1px solid rgba(154, 137, 255, 0.3);
    border-radius: 999px;
    color: #eeecff;
    background: rgba(125, 98, 255, 0.16);
    font-size: 12px;
    text-decoration: none;
    backdrop-filter: blur(14px);
    transition:
      transform 0.25s ease,
      background 0.25s ease;
  }
  .brand-cta a:last-child {
    color: rgba(219, 222, 238, 0.68);
    background: rgba(15, 18, 29, 0.52);
  }
  .brand-cta a:hover {
    background: rgba(126, 101, 255, 0.3);
    transform: translateY(-2px);
  }

  .chapter.is-active .chapter-copy {
    animation: chapter-copy-in 10s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  .s2.is-active .chapter-watermark,
  .s3.is-active .chapter-watermark {
    animation: chapter-watermark 10s ease-in-out both;
  }
  .s2.is-active .connection-status {
    animation: chapter-panel-in 10s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  .s3.is-active .route-sequence {
    animation: route-sequence-in 10s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  .s4.is-active .manage-metrics {
    animation: manage-metrics-in 10s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  .s5.is-active .chapter-copy {
    animation: scale-copy-in 10s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  .s5.is-active .scale-metrics {
    animation: scale-metrics-in 10s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  .s5.is-active .scale-orbit {
    animation: scale-orbit-in 10s ease-in-out both;
  }
  .s6.is-active .brand-finale {
    animation: brand-finale-in 10s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  .is-playing {
    .beat-one {
      animation: beat-one 10s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    .beat-two {
      animation: beat-two 10s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    .beat-three {
      animation: beat-three 10s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    .beat-four {
      animation: beat-four 10s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    .kinetic-api {
      animation: kinetic-api 10s ease-in-out both;
    }
    .kinetic-token {
      animation: kinetic-token 10s ease-in-out both;
    }
    .kinetic-key {
      animation: kinetic-key 10s ease-in-out both;
    }
    .kinetic-model {
      animation: kinetic-model 10s ease-in-out both;
    }
    .overlay-request {
      animation: overlay-request 10s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    .overlay-token {
      animation: overlay-token 10s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    .overlay-error {
      animation: overlay-error 10s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    .flare-violet {
      animation: flare-violet 10s ease-in-out both;
    }
    .flare-cyan {
      animation: flare-cyan 10s ease-in-out both;
    }
    .scene-grid {
      animation: grid-pulse 10s ease-in-out both;
    }
  }

  @keyframes beat-one {
    0% {
      opacity: 0;
      filter: blur(24px);
      transform: translate3d(-140px, 48px, 0) scale(0.82);
    }
    6% {
      opacity: 1;
      filter: blur(0);
      transform: translate3d(0, 0, 0) scale(1);
    }
    20% {
      opacity: 1;
      filter: blur(0);
      transform: translate3d(18px, -8px, 0) scale(1.025);
    }
    28%,
    100% {
      opacity: 0;
      filter: blur(18px);
      transform: translate3d(-190px, -35px, 0) scale(1.14);
    }
  }
  @keyframes beat-two {
    0%,
    21% {
      opacity: 0;
      filter: blur(22px);
      transform: translate3d(170px, 35px, 0) scale(0.84);
    }
    29% {
      opacity: 1;
      filter: blur(0);
      transform: translate3d(0, 0, 0) scale(1);
    }
    45% {
      opacity: 1;
      filter: blur(0);
      transform: translate3d(-14px, -8px, 0) scale(1.03);
    }
    55%,
    100% {
      opacity: 0;
      filter: blur(17px);
      transform: translate3d(-140px, -70px, 0) scale(1.17);
    }
  }
  @keyframes beat-three {
    0%,
    48% {
      opacity: 0;
      filter: blur(24px);
      transform: translate3d(-80px, 100px, 0) scale(0.78);
    }
    56% {
      opacity: 1;
      filter: blur(0);
      transform: translate3d(0, 0, 0) scale(1);
    }
    71% {
      opacity: 1;
      filter: blur(0);
      transform: translate3d(24px, -18px, 0) scale(1.035);
    }
    80%,
    100% {
      opacity: 0;
      filter: blur(22px);
      transform: translate3d(100px, -110px, 0) scale(1.16);
    }
  }
  @keyframes beat-four {
    0%,
    75% {
      opacity: 0;
      filter: blur(28px);
      transform: translate(-50%, -42%) scale(1.35);
    }
    84% {
      opacity: 1;
      filter: blur(0);
      transform: translate(-50%, -50%) scale(1);
    }
    95% {
      opacity: 1;
      filter: blur(0);
      transform: translate(-50%, -52%) scale(0.96);
    }
    100% {
      opacity: 0;
      filter: blur(18px);
      transform: translate(-50%, -56%) scale(0.78);
    }
  }
  @keyframes kinetic-api {
    0%,
    12% {
      opacity: 0;
      filter: blur(25px);
      transform: translate3d(45vw, 12vh, 0) rotate(7deg) scale(0.7);
    }
    22% {
      opacity: 0.24;
      filter: blur(0);
      transform: translate3d(0, 0, 0) rotate(-3deg) scale(1);
    }
    38%,
    100% {
      opacity: 0;
      filter: blur(17px);
      transform: translate3d(-52vw, -11vh, 0) rotate(-12deg) scale(1.3);
    }
  }
  @keyframes kinetic-token {
    0%,
    30% {
      opacity: 0;
      filter: blur(26px);
      transform: translate3d(-54vw, 14vh, 0) rotate(-8deg) scale(0.75);
    }
    43% {
      opacity: 0.2;
      filter: blur(0);
      transform: translate3d(0, 0, 0) rotate(2deg) scale(1);
    }
    59%,
    100% {
      opacity: 0;
      filter: blur(18px);
      transform: translate3d(48vw, -18vh, 0) rotate(10deg) scale(1.28);
    }
  }
  @keyframes kinetic-key {
    0%,
    44% {
      opacity: 0;
      filter: blur(24px);
      transform: translate3d(8vw, -52vh, 0) rotate(14deg) scale(0.72);
    }
    56% {
      opacity: 0.17;
      filter: blur(0);
      transform: translate3d(0, 0, 0) rotate(-4deg) scale(1);
    }
    70%,
    100% {
      opacity: 0;
      filter: blur(17px);
      transform: translate3d(-20vw, 55vh, 0) rotate(-16deg) scale(1.32);
    }
  }
  @keyframes kinetic-model {
    0%,
    58% {
      opacity: 0;
      filter: blur(24px);
      transform: translate3d(56vw, 7vh, 0) rotate(-7deg) scale(0.7);
    }
    70% {
      opacity: 0.2;
      filter: blur(0);
      transform: translate3d(0, 0, 0) rotate(1deg) scale(1);
    }
    84%,
    100% {
      opacity: 0;
      filter: blur(19px);
      transform: translate3d(-45vw, -17vh, 0) rotate(9deg) scale(1.25);
    }
  }
  @keyframes overlay-request {
    0%,
    22% {
      opacity: 0;
      filter: blur(14px);
      transform: translate3d(-180px, 110px, 0) rotate(-9deg) scale(0.7);
    }
    31% {
      opacity: 1;
      filter: blur(0);
      transform: translate3d(0, 0, 0) rotate(0) scale(1);
    }
    47% {
      opacity: 0.9;
      transform: translate3d(35px, -28px, 0) rotate(2deg) scale(1.04);
    }
    56%,
    100% {
      opacity: 0;
      filter: blur(12px);
      transform: translate3d(250px, -130px, 0) rotate(11deg) scale(1.18);
    }
  }
  @keyframes overlay-token {
    0%,
    42% {
      opacity: 0;
      filter: blur(16px);
      transform: translate3d(190px, -100px, 0) rotate(8deg) scale(0.68);
    }
    51% {
      opacity: 1;
      filter: blur(0);
      transform: translate3d(0, 0, 0) rotate(0) scale(1);
    }
    66% {
      opacity: 0.95;
      transform: translate3d(-28px, 34px, 0) rotate(-2deg) scale(1.05);
    }
    75%,
    100% {
      opacity: 0;
      filter: blur(14px);
      transform: translate3d(-230px, 150px, 0) rotate(-12deg) scale(1.22);
    }
  }
  @keyframes overlay-error {
    0%,
    55% {
      opacity: 0;
      filter: blur(17px);
      transform: translate3d(190px, 150px, 0) rotate(7deg) scale(0.7);
    }
    63% {
      opacity: 1;
      filter: blur(0);
      transform: translate3d(0, 0, 0) rotate(0) scale(1);
    }
    75% {
      opacity: 1;
      transform: translate3d(-30px, -25px, 0) rotate(-2deg) scale(1.06);
    }
    84%,
    100% {
      opacity: 0;
      filter: blur(15px);
      transform: translate3d(-260px, -130px, 0) rotate(-10deg) scale(1.18);
    }
  }
  @keyframes flare-violet {
    0% {
      opacity: 0;
      transform: scale(0.55);
    }
    35% {
      opacity: 0.8;
      transform: scale(1.05);
    }
    68% {
      opacity: 1;
      transform: translate3d(-10%, 8%, 0) scale(1.35);
    }
    100% {
      opacity: 0;
      transform: translate3d(-20%, 14%, 0) scale(1.65);
    }
  }
  @keyframes flare-cyan {
    0%,
    28% {
      opacity: 0;
      transform: scale(0.6);
    }
    58% {
      opacity: 0.7;
      transform: scale(1.08);
    }
    82% {
      opacity: 0.9;
      transform: translate3d(12%, -8%, 0) scale(1.42);
    }
    100% {
      opacity: 0;
      transform: scale(1.72);
    }
  }
  @keyframes grid-pulse {
    0% {
      opacity: 0.05;
      transform: scale(1.08);
    }
    42% {
      opacity: 0.36;
      transform: scale(1);
    }
    72% {
      opacity: 0.52;
      transform: scale(0.96);
    }
    100% {
      opacity: 0.08;
      transform: scale(0.9);
    }
  }
  @keyframes playback {
    to {
      transform: scaleX(1);
    }
  }
  @keyframes rec-pulse {
    0%,
    100% {
      opacity: 0.35;
      transform: scale(0.78);
    }
    50% {
      opacity: 1;
      transform: scale(1.22);
    }
  }
  @keyframes wave {
    from {
      opacity: 0.22;
      transform: scaleY(0.45);
    }
    to {
      opacity: 0.9;
      transform: scaleY(1);
    }
  }

  @keyframes chapter-copy-in {
    0% {
      opacity: 0;
      filter: blur(28px);
      transform: translate3d(-130px, 65px, 0) scale(0.8);
    }
    9% {
      opacity: 1;
      filter: blur(0);
      transform: translate3d(0, 0, 0) scale(1);
    }
    72% {
      opacity: 1;
      filter: blur(0);
      transform: translate3d(18px, -12px, 0) scale(1.025);
    }
    91%,
    100% {
      opacity: 0;
      filter: blur(20px);
      transform: translate3d(150px, -80px, 0) scale(1.15);
    }
  }
  @keyframes scale-copy-in {
    0% {
      opacity: 0;
      filter: blur(30px);
      transform: translate(-50%, 70px) scale(1.32);
    }
    10% {
      opacity: 1;
      filter: blur(0);
      transform: translate(-50%, 0) scale(1);
    }
    72% {
      opacity: 1;
      filter: blur(0);
      transform: translate(-50%, -14px) scale(1.025);
    }
    92%,
    100% {
      opacity: 0;
      filter: blur(23px);
      transform: translate(-50%, -100px) scale(0.78);
    }
  }
  @keyframes chapter-watermark {
    0% {
      opacity: 0;
      filter: blur(35px);
      transform: translate3d(45vw, 12vh, 0) rotate(7deg) scale(0.65);
    }
    22% {
      opacity: 0.62;
      filter: blur(0);
      transform: translate3d(0, 0, 0) rotate(-3deg) scale(1);
    }
    77% {
      opacity: 0.4;
      filter: blur(2px);
      transform: translate3d(-12vw, -6vh, 0) rotate(-7deg) scale(1.12);
    }
    100% {
      opacity: 0;
      filter: blur(24px);
      transform: translate3d(-48vw, -15vh, 0) rotate(-13deg) scale(1.35);
    }
  }
  @keyframes chapter-panel-in {
    0%,
    20% {
      opacity: 0;
      filter: blur(18px);
      transform: translate3d(180px, 130px, 0) rotate(8deg) scale(0.7);
    }
    34% {
      opacity: 1;
      filter: blur(0);
      transform: translate3d(0, 0, 0) rotate(0) scale(1);
    }
    76% {
      opacity: 1;
      transform: translate3d(-18px, -12px, 0) rotate(-1deg) scale(1.03);
    }
    92%,
    100% {
      opacity: 0;
      filter: blur(15px);
      transform: translate3d(-210px, -120px, 0) rotate(-9deg) scale(1.16);
    }
  }
  @keyframes route-sequence-in {
    0%,
    24% {
      opacity: 0;
      filter: blur(16px);
      transform: translate3d(190px, 0, 0) scale(0.75);
    }
    38% {
      opacity: 1;
      filter: blur(0);
      transform: translate3d(0, 0, 0) scale(1);
    }
    78% {
      opacity: 1;
      transform: translate3d(-20px, 0, 0) scale(1.03);
    }
    93%,
    100% {
      opacity: 0;
      filter: blur(14px);
      transform: translate3d(-190px, 0, 0) scale(1.16);
    }
  }
  @keyframes manage-metrics-in {
    0%,
    25% {
      opacity: 0;
      filter: blur(20px);
      transform: perspective(900px) rotateX(18deg) translate3d(0, 150px, 0)
        scale(0.72);
    }
    40% {
      opacity: 1;
      filter: blur(0);
      transform: perspective(900px) rotateX(0) translate3d(0, 0, 0) scale(1);
    }
    80% {
      opacity: 1;
      transform: perspective(900px) rotateX(-2deg) translate3d(-20px, -12px, 0)
        scale(1.03);
    }
    94%,
    100% {
      opacity: 0;
      filter: blur(18px);
      transform: perspective(900px) rotateX(-14deg)
        translate3d(-90px, -150px, 0) scale(1.15);
    }
  }
  @keyframes scale-metrics-in {
    0%,
    28% {
      opacity: 0;
      filter: blur(19px);
      transform: translate3d(0, 120px, 0) scaleX(0.68);
    }
    43% {
      opacity: 1;
      filter: blur(0);
      transform: translate3d(0, 0, 0) scaleX(1);
    }
    82% {
      opacity: 1;
      transform: translate3d(0, -8px, 0) scaleX(1);
    }
    96%,
    100% {
      opacity: 0;
      filter: blur(15px);
      transform: translate3d(0, -120px, 0) scaleX(1.12);
    }
  }
  @keyframes scale-orbit-in {
    0% {
      opacity: 0;
      transform: scale(0.25) rotate(-25deg);
    }
    28% {
      opacity: 0.65;
      transform: scale(0.85) rotate(0);
    }
    78% {
      opacity: 0.9;
      transform: scale(1.28) rotate(28deg);
    }
    100% {
      opacity: 0;
      transform: scale(1.9) rotate(60deg);
    }
  }
  @keyframes brand-finale-in {
    0%,
    16% {
      opacity: 0;
      filter: blur(34px);
      transform: translate(-50%, -50%) scale(1.7);
    }
    34% {
      opacity: 1;
      filter: blur(0);
      transform: translate(-50%, -50%) scale(1);
    }
    82% {
      opacity: 1;
      filter: blur(0);
      transform: translate(-50%, -52%) scale(0.98);
    }
    96% {
      opacity: 1;
      filter: blur(0);
      transform: translate(-50%, -52%) scale(0.96);
    }
    100% {
      opacity: 0;
      filter: blur(20px);
      transform: translate(-50%, -55%) scale(0.82);
    }
  }

  @media (max-width: 900px) {
    .hud-header {
      width: calc(100% - 50px);
    }
    .hud-title,
    .chapter-index,
    .telemetry {
      display: none;
    }
    .hud-header {
      grid-template-columns: 1fr auto;
    }
    .beat-one,
    .beat-three {
      left: 32px;
      width: 84vw;
    }
    .beat-two {
      right: 32px;
      width: 86vw;
    }
    .story-beat h1 {
      font-size: clamp(54px, 13vw, 90px);
    }
    .story-beat h2 {
      font-size: clamp(43px, 10vw, 72px);
    }
    .overlay-card {
      scale: 0.82;
    }
    .overlay-request {
      bottom: 14%;
      left: 0;
    }
    .overlay-token {
      top: 17%;
      right: -15px;
    }
    .overlay-error {
      right: -12px;
      bottom: 14%;
    }
    .playback-bar {
      right: 25px;
      left: 25px;
      grid-template-columns: 112px 1fr 38px;
    }
    .connection-copy,
    .manage-copy {
      left: 32px;
      width: 78vw;
    }
    .route-copy {
      right: 32px;
      width: 82vw;
    }
    .chapter-copy h2 {
      font-size: clamp(42px, 9vw, 72px);
    }
    .connection-status {
      right: 28px;
      bottom: 13vh;
      transform-origin: right bottom;
    }
    .route-sequence {
      right: 30px;
      bottom: 12vh;
      transform-origin: right bottom;
    }
    .manage-metrics {
      right: 28px;
      bottom: 11vh;
      width: 72vw;
    }
    .scale-metrics {
      right: 28px;
      left: 28px;
    }
  }

  @media (max-width: 560px) {
    #pages_demo,
    #pages_demo .s1 {
      min-height: 560px;
    }
    .hud-header {
      width: calc(100% - 32px);
      height: 54px;
    }
    .brand-mark {
      width: 27px;
      height: 27px;
    }
    .beat-one,
    .beat-three {
      top: 22%;
      left: 22px;
      width: calc(100% - 44px);
    }
    .beat-two {
      top: 24%;
      right: 22px;
      width: calc(100% - 44px);
    }
    .beat-four {
      width: calc(100% - 34px);
    }
    .story-beat h1 {
      font-size: clamp(48px, 15vw, 74px);
    }
    .story-beat h2 {
      font-size: clamp(39px, 12vw, 62px);
    }
    .story-beat small {
      font-size: 11px;
    }
    .beat-stats span {
      min-width: 90px;
      padding: 0 12px;
    }
    .overlay-card {
      scale: 0.68;
    }
    .overlay-request {
      left: -36px;
      bottom: 11%;
    }
    .overlay-token {
      top: 14%;
      right: -50px;
    }
    .overlay-error {
      right: -48px;
      bottom: 10%;
    }
    .playback-bar {
      bottom: 26px;
      grid-template-columns: 1fr 36px;
    }
    .playback-bar > p:first-child {
      display: none;
    }
    .kinetic-type span {
      font-size: 38vw;
    }
    .chapter-copy {
      width: calc(100% - 44px);
    }
    .connection-copy,
    .manage-copy {
      top: 21%;
      left: 22px;
      width: calc(100% - 44px);
    }
    .route-copy {
      top: 22%;
      right: 22px;
      width: calc(100% - 44px);
    }
    .scale-copy {
      top: 19%;
      width: calc(100% - 34px);
    }
    .chapter-copy h2 {
      font-size: clamp(37px, 11vw, 58px);
    }
    .chapter-copy small {
      font-size: 11px;
    }
    .connection-status {
      right: 4px;
      bottom: 9vh;
      scale: 0.75;
    }
    .route-sequence {
      right: -52px;
      bottom: 9vh;
      scale: 0.68;
    }
    .manage-metrics {
      right: 12px;
      bottom: 8vh;
      width: calc(100% - 24px);
    }
    .manage-metrics span {
      padding: 13px 10px;
    }
    .manage-metrics b {
      font-size: 15px;
    }
    .scale-metrics {
      right: 12px;
      bottom: 8vh;
      left: 12px;
      grid-template-columns: repeat(2, 1fr);
    }
    .scale-metrics span {
      padding: 11px 12px;
    }
    .scale-metrics span:nth-child(3) {
      border-left: 0;
    }
    .brand-finale {
      width: calc(100% - 28px);
    }
    .brand-finale h2 {
      font-size: clamp(41px, 12vw, 64px);
    }
    .final-logo {
      width: 66px;
      height: 66px;
      margin-bottom: 22px;
      border-radius: 19px;
    }
    .final-logo img {
      width: 48px;
      height: 48px;
    }
    .brand-cta {
      flex-direction: column;
      align-items: center;
      margin-top: 25px;
    }
    .brand-cta a {
      min-width: 180px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .hud-time i,
    .token-wave i {
      animation: none !important;
    }
  }
</style>
