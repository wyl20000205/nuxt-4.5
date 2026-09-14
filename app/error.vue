<template>
  <main class="error-page">
    <section class="error-card" aria-labelledby="error-title">
      <p class="error-code">{{ statusCode }}</p>
      <div class="error-copy">
        <p class="eyebrow">页面遇到了一点问题</p>
        <h1 id="error-title">{{ title }}</h1>
        <p class="message">{{ message }}</p>
      </div>

      <dl class="error-details">
        <div>
          <dt>状态码</dt>
          <dd>{{ statusCode }}</dd>
        </div>
        <div v-if="pageError.url">
          <dt>请求地址</dt>
          <dd>{{ pageError.url }}</dd>
        </div>
        <div v-if="pageError.statusMessage">
          <dt>错误类型</dt>
          <dd>{{ pageError.statusMessage }}</dd>
        </div>
      </dl>

      <details v-if="isDev && pageError.stack" class="developer-details">
        <summary>开发信息</summary>
        <pre>{{ pageError.stack }}</pre>
      </details>

      <div class="error-actions flex">
        <button type="button" class="primary" @click="goHome">返回首页</button>
        <button type="button" class="secondary" @click="retry">重新加载</button>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
  import type { NuxtError } from "#app";

  const props = defineProps<{ error?: NuxtError }>();
  const currentError = useError();
  const route = useRoute();
  const isDev = import.meta.dev;
  const pageError = computed(
    () =>
      props.error ||
      currentError.value ||
      ({
        statusCode: 500,
        statusMessage: "Unknown error",
        message: "当前没有可显示的错误详情，请返回首页继续浏览。",
        url: route.fullPath,
      } as NuxtError),
  );
  const statusCode = computed(() => pageError.value.statusCode || 500);
  const title = computed(() =>
    statusCode.value === 404 ? "没有找到这个页面" : "服务暂时不可用",
  );
  const message = computed(
    () =>
      pageError.value.message ||
      (statusCode.value === 404
        ? "链接可能已经失效，或页面地址输入有误。"
        : "请求未能完成，请稍后重新尝试。"),
  );

  useHead(() => ({ title: `${statusCode.value} · ${title.value}` }));

  const goHome = () => clearError({ redirect: "/" });
  const retry = () => window.location.reload();
</script>

<style lang="less" scoped>
  .error-page {
    --ink: #171719;
    --muted: #6f7078;
    --line: #dedfe4;
    --paper: rgba(255, 255, 255, 0.9);

    display: grid;
    box-sizing: border-box;
    min-height: 100dvh;
    place-items: center;
    padding: 32px;
    color: var(--ink);
    background:
      radial-gradient(circle at 18% 18%, rgba(255, 220, 183, 0.7), transparent 28%),
      radial-gradient(circle at 82% 78%, rgba(190, 213, 255, 0.72), transparent 30%),
      #f4f3ef;
    font-family: Inter, "PingFang SC", "Microsoft YaHei", sans-serif;
  }

  .error-card {
    position: relative;
    box-sizing: border-box;
    width: min(100%, 780px);
    padding: clamp(28px, 6vw, 64px);
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.82);
    border-radius: 28px;
    background: var(--paper);
    box-shadow: 0 28px 80px rgba(31, 34, 43, 0.14);
    backdrop-filter: blur(18px);
  }

  .error-code {
    position: absolute;
    top: -52px;
    right: 22px;
    margin: 0;
    color: rgba(23, 23, 25, 0.05);
    font-size: clamp(150px, 28vw, 260px);
    font-weight: 900;
    line-height: 1;
    letter-spacing: -0.09em;
    user-select: none;
  }

  .error-copy {
    position: relative;
    max-width: 540px;
  }

  .eyebrow {
    margin: 0 0 12px;
    color: #9b5b2c;
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 0.14em;
  }

  h1 {
    margin: 0;
    font-size: clamp(34px, 6vw, 62px);
    line-height: 1.08;
    letter-spacing: -0.055em;
  }

  .message {
    max-width: 500px;
    margin: 20px 0 0;
    color: var(--muted);
    font-size: 17px;
    line-height: 1.75;
  }

  .error-details {
    position: relative;
    display: grid;
    gap: 0;
    margin: 34px 0 0;
    border-top: 1px solid var(--line);
    border-bottom: 1px solid var(--line);

    div {
      display: grid;
      grid-template-columns: 92px minmax(0, 1fr);
      gap: 16px;
      padding: 13px 0;

      & + div {
        border-top: 1px solid var(--line);
      }
    }

    dt,
    dd {
      margin: 0;
      font-size: 14px;
      line-height: 1.55;
    }

    dt {
      color: var(--muted);
    }

    dd {
      min-width: 0;
      overflow-wrap: anywhere;
      font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
    }
  }

  .developer-details {
    margin-top: 18px;

    summary {
      width: fit-content;
      color: var(--muted);
      font-size: 14px;
      cursor: pointer;
    }

    pre {
      max-height: 220px;
      margin: 12px 0 0;
      padding: 16px;
      overflow: auto;
      border-radius: 12px;
      color: #e7e8ec;
      background: #202126;
      font-size: 12px;
      line-height: 1.6;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }
  }

  .error-actions {
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 32px;

    button {
      min-width: 122px;
      height: 46px;
      padding: 0 22px;
      border-radius: 12px;
      font: inherit;
      font-weight: 700;
      cursor: pointer;
      transition:
        transform 0.18s ease,
        box-shadow 0.18s ease;

      &:hover {
        transform: translateY(-2px);
      }

      &:focus-visible {
        outline: 3px solid rgba(23, 23, 25, 0.22);
        outline-offset: 3px;
      }
    }

    .primary {
      border: 1px solid var(--ink);
      color: #fff;
      background: var(--ink);
      box-shadow: 0 8px 22px rgba(23, 23, 25, 0.2);
    }

    .secondary {
      border: 1px solid var(--line);
      color: var(--ink);
      background: #fff;
    }
  }

  @media screen and (max-width: 600px) {
    .error-page {
      align-items: start;
      padding: 18px;
    }

    .error-card {
      margin-top: 6dvh;
      border-radius: 22px;
    }

    .error-code {
      top: -24px;
      right: 12px;
      font-size: 134px;
    }

    .error-details div {
      grid-template-columns: 1fr;
      gap: 3px;
    }

    .error-actions button {
      flex: 1;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .error-actions button {
      transition: none;
    }
  }
</style>
