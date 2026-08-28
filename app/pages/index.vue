<template>
  <div id="pages_index" class="pc">
    <Transition name="loading-mask">
      <div
        v-if="isPageLoading"
        class="page-loading mb"
        role="status"
        aria-live="polite"
        aria-label="页面资源加载中"
      >
        <div class="loading-symbol" aria-hidden="true">
          <span></span>
          <span></span>
          <i>JY</i>
        </div>
        <p>正在加载网络</p>
        <i class="loading-line" aria-hidden="true"></i>
      </div>
    </Transition>
    <div class="ink-scene" aria-hidden="true">
      <span
        v-for="(_, index) in rippleStyles"
        :key="index"
        :style="rippleStyles[index]"
        @animationiteration="randomizeRipple(index)"
      ></span>
    </div>
    <header :class="{ 'is-condensed': isHeaderCondensed }">
      <div class="l">
        <p>
          <img src="/images/logo_2.png" alt="九音图标" />
          <img src="/images/logo_1.png" alt="JIUYIN" />
        </p>
      </div>
      <div class="r">
        <p><i class="agent_btn btn">媒体流</i></p>
        <p><i class="agent_btn btn">剪辑流</i></p>
        <p><i class="agent_btn btn">智能体</i></p>
        <p><i @click="go_ai" class="api_btn">密钥</i></p>
        <p><i @click="go_login" class="login_btn">登录</i></p>
        <p class="language"><i class="is-active">中文</i><i>EN</i></p>
      </div>
    </header>
    <main :class="{ 'is-ready': isMainReady }">
      <div class="l">
        <p>
          <i class="yumao icon-star-smile-line"></i
          ><i
            >主流智能模型统一聚合，一个接口完成调用管理，让模型调用简单又稳定。无需切换平台轻松实现高并发、低延迟的智能服务集成。
            <span class="notice-arrow">→</span></i
          >
        </p>
        <p>快速连接 主流模型</p>
        <div class="features">
          <div>
            <p>一次接入</p>
            <p>接入一个密钥，即可<br />调用多家主流模型</p>
          </div>
          <div>
            <p>格式兼容</p>
            <p>统一请求格式，快速<br />切换不同模型</p>
          </div>
          <div>
            <p>统一管理</p>
            <p>密钥、账单、线路统一集中管理</p>
          </div>
        </div>
      </div>
      <div class="r" @click="go_ai_web">
        <p>模型聚合<br />调用网关</p>
        <p>
          <i>获取密钥 <span class="todo"></span></i>
        </p>
      </div>
    </main>
    <footer ref="footerElement" :class="{ 'is-ready': isFooterReady }">
      <div class="footer-columns">
        <div class="c_1">
          <p class="footer-logo">
            <img src="/images/logo_2.png" alt="九音图标" />
            <img src="/images/logo_1.png" alt="JIUYIN" />
          </p>
          <p>AI 模型服务与开放平台</p>
          <p>连接每一份 AI 能力</p>
          <p>让智能调用更简单</p>
          <p class="socials">
            <a href="mailto:hello@jiuyin.ai" aria-label="邮箱">✉</a>
            <a href="#" aria-label="GitHub">GH</a>
            <a href="#" aria-label="微信">微</a>
            <a href="#" aria-label="知乎">知</a>
          </p>
        </div>
        <div class="c_2">
          <p>产品</p>
          <a href="#">模型广场</a>
          <a href="#">开放平台</a>
          <a href="#">开发文档</a>
          <a href="#">价格说明</a>
          <a href="#">服务状态</a>
        </div>
        <div class="c_3">
          <p>能力</p>
          <a href="#">主流模型</a>
          <a href="#">智能路由</a>
          <a href="#">统一密钥</a>
          <a href="#">用量管理</a>
          <a href="#">更多能力</a>
        </div>
        <div class="c_4">
          <p>法务</p>
          <a href="#">隐私政策</a>
          <a href="#">用户协议</a>
          <a href="#">安全反馈</a>
          <a href="#">服务条款</a>
        </div>
        <div class="c_5">
          <p>加入</p>
          <a href="#">岗位详情</a>
          <a href="#">联系我们</a>
        </div>
      </div>
      <p class="copyright">
        2026 久引智能科技（江苏）有限公司 Inc. 保留所有权利 — All Rights
        Reserved. 苏ICP备2026050001号
      </p>
    </footer>
  </div>
</template>

<script setup lang="ts">
  const isHeaderCondensed = ref(false);
  const isPageLoading = ref(true);
  const isMainReady = ref(false);
  const isFooterReady = ref(false);
  const footerElement = ref<HTMLElement | null>(null);
  const rippleStyles = ref([
    { left: "20%", top: "16%", animationDelay: "0s" },
    { left: "70%", top: "35%", animationDelay: "-2s" },
    { left: "12%", top: "70%", animationDelay: "-4s" },
    { left: "58%", top: "68%", animationDelay: "-6s" },
  ]);
  let mainRevealFrame = 0;
  let mainReadyFrame = 0;
  let loadingTimer = 0;
  let isPageUnmounted = false;
  let footerObserver: IntersectionObserver | null = null;

  const updateHeaderState = () => {
    isHeaderCondensed.value = window.scrollY > 8;
  };

  const createRipplePosition = (index: number) => {
    const current = rippleStyles.value[index];
    let left = 8 + Math.random() * 76;
    let top = 8 + Math.random() * 72;
    const currentLeft = Number.parseFloat(current?.left || "0");
    const currentTop = Number.parseFloat(current?.top || "0");

    while (
      Math.abs(left - currentLeft) < 18 &&
      Math.abs(top - currentTop) < 18
    ) {
      left = 8 + Math.random() * 76;
      top = 8 + Math.random() * 72;
    }

    return {
      left: `${left.toFixed(2)}%`,
      top: `${top.toFixed(2)}%`,
      animationDelay: `${index * -2}s`,
    };
  };

  const randomizeRipple = (index: number) => {
    rippleStyles.value[index] = createRipplePosition(index);
  };

  const waitForWindowLoad = () => {
    if (document.readyState === "complete") return Promise.resolve();

    return new Promise<void>((resolve) => {
      window.addEventListener("load", () => resolve(), { once: true });
    });
  };

  const waitForImages = () => {
    const images = Array.from(
      document.querySelectorAll<HTMLImageElement>("#pages_index img"),
    );

    return Promise.all(
      images.map((image) => {
        if (image.complete) return Promise.resolve();
        return new Promise<void>((resolve) => {
          image.addEventListener("load", () => resolve(), { once: true });
          image.addEventListener("error", () => resolve(), { once: true });
        });
      }),
    );
  };

  const waitForFonts = async () => {
    if (!("fonts" in document)) return;
    await Promise.all([
      document.fonts.load(
        '400 18px "FZJuZhenXinFangS-R-GB"',
        "主流智能模型统一聚合连接调用管理",
      ),
      document.fonts.ready,
    ]);
  };

  const waitForPageResources = () =>
    Promise.race([
      Promise.all([waitForWindowLoad(), waitForImages(), waitForFonts()]),
      new Promise<void>((resolve) => {
        loadingTimer = window.setTimeout(resolve, 8000);
      }),
    ]);

  const revealMain = () => {
    mainRevealFrame = requestAnimationFrame(() => {
      mainReadyFrame = requestAnimationFrame(() => {
        isMainReady.value = true;
      });
    });
  };

  onMounted(async () => {
    window.addEventListener("scroll", updateHeaderState, { passive: true });
    updateHeaderState();
    rippleStyles.value = rippleStyles.value.map((_, index) =>
      createRipplePosition(index),
    );
    footerObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        isFooterReady.value = true;
        footerObserver?.disconnect();
      },
      {
        threshold: 0.04,
        rootMargin: "0px 0px 80px 0px",
      },
    );

    if (footerElement.value) {
      footerObserver.observe(footerElement.value);
    }

    await waitForPageResources();
    window.clearTimeout(loadingTimer);
    if (isPageUnmounted) return;
    isPageLoading.value = false;
    await nextTick();
    revealMain();
  });

  onBeforeUnmount(() => {
    isPageUnmounted = true;
    window.removeEventListener("scroll", updateHeaderState);
    window.clearTimeout(loadingTimer);
    cancelAnimationFrame(mainRevealFrame);
    cancelAnimationFrame(mainReadyFrame);
    footerObserver?.disconnect();
  });

  useHead({
    htmlAttrs: {
      class: "index-scrollbar-hidden",
    },
    bodyAttrs: {
      class: "index-scrollbar-hidden",
    },
  });

  let router = useRouter();

  const go_ai_web = () => router.push("/login");

  const go_ai = () => router.push("/login");
  const go_login = () => {
    router.push("/login");
  };
</script>

<style scoped lang="less">
  #pages_index {
    position: relative;
    width: 100%;
    overflow: hidden;
    isolation: isolate;
    color: #102c25;
    background: linear-gradient(
      112deg,
      rgba(251, 253, 252, 0.96),
      rgba(229, 241, 235, 0.78)
    );

    &::before,
    &::after {
      position: absolute;
      z-index: -1;
      pointer-events: none;
      content: "";
    }

    &::before {
      inset: 0;
      opacity: 0.58;
      background-image:
        linear-gradient(90deg, rgba(34, 111, 79, 0.095) 1px, transparent 1px),
        linear-gradient(rgba(34, 111, 79, 0.045) 1px, transparent 1px);
      background-size:
        128px 100%,
        100% 128px;
      mask-image: linear-gradient(
        90deg,
        rgba(0, 0, 0, 0.68),
        rgba(0, 0, 0, 0.16)
      );
    }

    &::after {
      inset: 0;
      opacity: 0.54;
      background: linear-gradient(
        111deg,
        transparent 27%,
        rgba(255, 255, 255, 0.38) 48%,
        transparent 64%
      );
      mix-blend-mode: soft-light;
    }

    .page-loading {
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: flex;
      height: 100vh;
      overflow: hidden;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #0a7f50;
      background:
        linear-gradient(rgba(249, 255, 252, 0.94), rgba(235, 248, 241, 0.96)),
        #edf7f2;

      .loading-symbol {
        position: relative;
        display: grid;
        width: 84px;
        height: 84px;
        place-items: center;

        span {
          position: absolute;
          inset: 0;
          border: 1px solid rgba(10, 151, 92, 0.44);
          border-radius: 50%;
          animation: loading-ripple 1.8s ease-out infinite;
        }

        span:nth-child(2) {
          animation-delay: 0.6s;
        }

        i {
          position: relative;
          z-index: 1;
          font-size: 19px;
          font-style: normal;
          font-weight: 600;
          letter-spacing: 0.08em;
        }
      }

      p {
        margin: 22px 0 14px;
        font-size: 15px;
        letter-spacing: 0.16em;
      }

      .loading-line {
        position: relative;
        display: block;
        width: 150px;
        height: 2px;
        overflow: hidden;
        border-radius: 2px;
        background: rgba(13, 138, 86, 0.12);

        &::after {
          position: absolute;
          top: 0;
          left: 0;
          width: 52px;
          height: 100%;
          border-radius: inherit;
          background: #0aa366;
          box-shadow: 0 0 14px rgba(10, 163, 102, 0.42);
          content: "";
          animation: loading-line-move 1.2s ease-in-out infinite;
        }
      }
    }

    .loading-mask-leave-active {
      transition:
        opacity 0.55s ease,
        filter 0.55s ease;
    }

    .loading-mask-leave-to {
      opacity: 0;
      filter: blur(12px);
    }

    .ink-scene {
      position: absolute;
      inset: 0;
      z-index: 0;
      overflow: hidden;
      contain: paint;
      pointer-events: none;

      &::before,
      &::after {
        position: absolute;
        will-change: transform;
        content: "";
      }

      &::before {
        inset: -38%;
        opacity: 0.44;
        background: repeating-radial-gradient(
          ellipse at 28% 36%,
          transparent 0 7.5%,
          rgba(26, 141, 93, 0.18) 7.8% 8.1%,
          transparent 8.4% 12.5%
        );
        animation: ripple-field-one 18s ease-in-out infinite alternate;
      }

      &::after {
        inset: -44%;
        opacity: 0.36;
        background: repeating-radial-gradient(
          ellipse at 76% 62%,
          transparent 0 8%,
          rgba(69, 181, 132, 0.18) 8.3% 8.6%,
          transparent 8.9% 13.4%
        );
        animation: ripple-field-two 22s ease-in-out infinite alternate;
      }

      span {
        position: absolute;
        display: block;
        width: 180px;
        height: 180px;
        border: 2px solid rgba(21, 154, 97, 0.34);
        border-radius: 50%;
        opacity: 0;
        background: transparent;
        box-shadow:
          0 0 0 42px rgba(21, 154, 97, 0.16),
          0 0 0 84px rgba(21, 154, 97, 0.1),
          0 0 0 126px rgba(21, 154, 97, 0.06);
        will-change: transform, opacity;
        animation: page-ripple 8s cubic-bezier(0.2, 0.62, 0.24, 1) infinite;
      }
    }

    header {
      position: fixed;
      top: 10px;
      left: 50%;
      z-index: 10;
      box-sizing: border-box;
      display: flex;
      width: 80%;
      height: 50px;
      margin: 0;
      padding: 0 30px;
      transform: translateX(-50%);
      align-items: center;
      justify-content: space-between;
      border: 1px solid transparent;
      border-radius: 999px;
      background: transparent;
      box-shadow: none;
      backdrop-filter: blur(0);
      transition:
        width 0.42s ease,
        border-color 0.42s ease,
        background 0.42s ease,
        box-shadow 0.42s ease,
        backdrop-filter 0.42s ease;

      &.is-condensed {
        width: 75%;
        border-color: rgba(38, 128, 91, 0.16);
        background: rgba(247, 255, 251, 0.58);
        backdrop-filter: blur(18px);
      }

      .l p,
      .r,
      .r p,
      .language {
        display: flex;
        align-items: center;
      }

      .l p {
        gap: 2px;
        margin: 0;
        img {
          cursor: pointer;
        }

        img:first-child {
          width: 25px;
          height: 25px;
          object-fit: contain;
        }

        img:last-child {
          width: 109px;
          height: auto;
        }
      }

      .r {
        gap: 38px;

        p {
          margin: 0;
        }

        i {
          font-style: normal;
        }

        .login_btn,
        .agent_btn {
          cursor: pointer;
          transition: color 0.2s ease;
          &:hover {
            color: #08a96a;
          }
        }

        > p:first-child i {
          color: #174a3a;
          font-size: 16px;
          letter-spacing: 0.02em;
          cursor: pointer;
          transition: color 0.2s ease;
          &:hover {
            color: #08a96a;
          }
        }

        .language {
          gap: 2px;
          padding: 4px 2px;
          border: 1px solid rgba(33, 126, 87, 0.17);
          border-radius: 999px;
          background: rgba(220, 246, 232, 0.38);

          i {
            width: 49px;
            padding: 6px 3px;
            border-radius: 999px;
            color: #477569;
            font-size: 13px;
            line-height: 1;
            text-align: center;
            cursor: pointer;
            transition: 0.22s ease;

            &.is-active {
              color: #126446;
              background: rgba(255, 255, 255, 0.78);
              box-shadow: 0 3px 12px rgba(33, 131, 91, 0.1);
            }
          }
        }
      }
    }
    main {
      position: relative;
      z-index: 1;
      display: flex;
      width: 75%;
      box-sizing: border-box;
      height: 70vh;
      margin: 0 auto;
      margin-top: 205px;
      padding: 0 0 90px;
      opacity: 0;
      filter: blur(16px);
      transform: translateY(96px);
      transition:
        opacity 1s ease,
        filter 1s ease,
        transform 1s cubic-bezier(0.2, 0.72, 0.22, 1);
      align-items: center;
      justify-content: space-between;
      gap: 140px;

      &.is-ready {
        opacity: 1;
        filter: blur(0);
        transform: translateY(0);
      }

      > .l {
        flex: 1 1 auto;

        > p:first-child {
          display: flex;
          max-width: 760px;
          margin: 0 0 34px;
          align-items: flex-start;
          gap: 9px;
          color: rgba(32, 78, 63, 0.66);
          font-size: 17px;
          line-height: 1.75;
          cursor: pointer;
          transition: all 0.3s;
          &:hover {
            color: rgb(119, 104, 104);
          }
          i {
            font-style: normal;
          }

          .yumao {
            flex: 0 0 auto;
            color: #16a96d;
            font-size: 18px;
            line-height: inherit;
            transform-origin: center;
            will-change: transform, opacity;
          }

          .notice-arrow {
            display: inline-block;
            margin-left: 9px;
            color: #16a96d;
            transition: transform 0.22s ease;
          }

          &:hover .notice-arrow {
            transform: translateX(6px);
          }
        }

        > p:nth-child(2) {
          margin: 0;
          color: #133e31;
          font-size: 56px;
          font-weight: 500;
          letter-spacing: 0.08em;
          line-height: 1.18;
        }
      }

      .features {
        display: grid;
        margin-top: 60px;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;

        > div {
          height: 150px;
          padding: 26px 25px 23px;
          box-sizing: border-box;
          border: 1px solid rgba(255, 255, 255, 0.78);
          border-radius: 24px;
          background: rgba(249, 255, 252, 0.4);
          box-shadow:
            inset 0 1px rgba(255, 255, 255, 0.72),
            0 16px 40px rgba(38, 110, 82, 0.06);
          backdrop-filter: blur(18px);
          cursor: pointer;
          transition:
            transform 0.26s ease,
            background 0.26s ease,
            box-shadow 0.26s ease;

          &:hover {
            transform: translateY(-2px);
            background: rgba(252, 255, 253, 0.64);
            box-shadow:
              inset 0 1px rgba(255, 255, 255, 0.84),
              0 22px 45px rgba(30, 129, 89, 0.13);
          }

          p {
            margin: 0;
          }

          p:first-child {
            margin-bottom: 14px;
            color: #0a9860;
            font-size: 23px;
            font-weight: 600;
          }

          p:last-child {
            color: rgba(22, 63, 49, 0.72);
            font-size: 15px;
            line-height: 1.65;
          }
        }
      }

      > .r {
        position: relative;
        display: flex;
        flex: 0 0 520px;
        width: 240px;
        height: 350px;
        padding: 52px;
        overflow: hidden;
        box-sizing: border-box;
        flex-direction: column;
        justify-content: flex-end;
        border: 1px solid rgba(137, 245, 190, 0.18);
        border-radius: 28px;
        color: #f5fff9;
        cursor: pointer;
        background:
          radial-gradient(
            ellipse 49% 80% at 85% 1%,
            rgba(85, 218, 151, 0.53),
            transparent 67%
          ),
          radial-gradient(
            ellipse 45% 54% at 8% 94%,
            rgba(15, 87, 59, 0.84),
            transparent 73%
          ),
          linear-gradient(135deg, #087044, #075b3e 48%, #0a8050);
        box-shadow:
          inset 0 1px rgba(239, 255, 246, 0.26),
          0 28px 64px rgba(20, 101, 69, 0.2);
        isolation: isolate;

        &::before,
        &::after {
          position: absolute;
          z-index: 0;
          content: "";
          pointer-events: none;
        }

        &::before {
          inset: -70%;
          opacity: 0.92;
          filter: blur(5px);
          background: repeating-radial-gradient(
            ellipse at 55% 51%,
            transparent 0 7%,
            rgba(205, 255, 227, 0.24) 7.5% 8.2%,
            transparent 8.8% 13%
          );
          mix-blend-mode: screen;
          transform: rotate(-18deg) scale(1.35);
          will-change: transform;
          animation: card-water-rings 12s ease-in-out infinite alternate;
        }

        &::after {
          right: -18%;
          bottom: -44%;
          width: 124%;
          height: 82%;
          border-radius: 48% 52% 36% 64% / 57% 38% 62% 43%;
          opacity: 0.7;
          filter: blur(13px);
          background:
            radial-gradient(
              ellipse at 55% 25%,
              rgba(186, 255, 218, 0.64),
              transparent 31%
            ),
            radial-gradient(
              ellipse at 39% 52%,
              rgba(15, 79, 54, 0.86),
              transparent 56%
            );
          mix-blend-mode: soft-light;
          animation: card-water-flow 14s ease-in-out infinite alternate;
          will-change: transform;
        }

        p {
          position: relative;
          z-index: 1;
          margin: 0;
        }

        p:first-child {
          margin-bottom: 30px;
          font-size: 45px;
          font-weight: 450;
          letter-spacing: 0.015em;
          line-height: 1.42;
          text-shadow: 0 2px 22px rgba(0, 56, 36, 0.3);
        }

        p:last-child {
          display: flex;
          align-items: center;
          gap: 9px;
          color: rgba(237, 255, 244, 0.84);
          font-size: 16px;

          i {
            font-style: normal;
          }

          .todo::after {
            content: "↗";
            display: inline-block;
            font-family: inherit;
            font-size: 20px;
            transition: transform 0.25s ease;
          }
        }

        &:hover .todo::after {
          transform: translate3d(5px, -5px, 0);
        }
      }
    }

    footer {
      position: relative;
      z-index: 1;
      margin-top: 140px;
      padding: 100px 0 34px;
      opacity: 0;
      filter: blur(14px);
      transform: translate3d(100px, 120px, 0);
      border-top: 1px solid rgba(27, 107, 76, 0.1);
      background: rgba(250, 255, 252, 0.66);
      box-shadow: inset 0 1px rgba(255, 255, 255, 0.82);
      backdrop-filter: blur(22px);
      transition:
        opacity 1s ease,
        filter 1s ease,
        transform 1s cubic-bezier(0.2, 0.72, 0.22, 1);

      &.is-ready {
        opacity: 1;
        filter: blur(0);
        transform: translate3d(0, 0, 0);
      }

      .footer-columns {
        display: grid;
        width: 80%;
        margin: 0 auto;
        grid-template-columns: 1.42fr repeat(4, 0.86fr);
        gap: 72px;

        > div {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 20px;

          p,
          a {
            margin: 0;
            color: rgba(20, 62, 48, 0.71);
            font-size: 16px;
            line-height: 1.35;
            text-decoration: none;
          }

          > p:first-child {
            margin-bottom: 15px;
            color: #143e31;
            font-size: 17px;
            font-weight: 500;
          }

          a {
            position: relative;
            transition:
              color 0.2s ease,
              transform 0.2s ease;

            &::after {
              position: absolute;
              bottom: -4px;
              left: 0;
              width: 0;
              height: 1px;
              background: #12a769;
              content: "";
              transition: width 0.2s ease;
            }

            &:hover {
              color: #07975d;
              transform: translateX(3px);

              &::after {
                width: 100%;
              }
            }
          }
        }

        .c_1 {
          gap: 11px;

          .footer-logo {
            display: flex;
            margin-bottom: 25px;
            align-items: center;
            gap: 9px;

            img:first-child {
              width: 34px;
              height: 34px;
              object-fit: contain;
            }

            img:last-child {
              width: 118px;
              height: auto;
            }
          }

          .socials {
            display: flex;
            margin-top: 28px;
            gap: 13px;

            a {
              display: grid;
              width: 29px;
              height: 29px;
              place-items: center;
              border: 1px solid rgba(22, 113, 78, 0.2);
              border-radius: 50%;
              color: rgba(20, 73, 55, 0.76);
              font-size: 11px;
              font-weight: 600;
              transform: none;

              &::after {
                display: none;
              }

              &:hover {
                border-color: #0aa064;
                color: #fff;
                background: #0aa064;
                box-shadow: 0 6px 14px rgba(10, 160, 100, 0.2);
                transform: translateY(-3px);
              }
            }
          }
        }
      }

      .copyright {
        width: 80%;
        margin: 84px auto 0;
        padding-top: 28px;
        border-top: 1px solid rgba(27, 107, 76, 0.1);
        color: rgba(20, 62, 48, 0.58);
        font-size: 14px;
      }
    }
  }
  @keyframes notice-star-pulse {
    from {
      opacity: 0.58;
      transform: translateY(1px) rotate(-8deg) scale(0.88);
      text-shadow: 0 0 0 rgba(22, 169, 109, 0);
    }
    to {
      opacity: 1;
      transform: translateY(-2px) rotate(8deg) scale(1.18);
      text-shadow: 0 0 12px rgba(22, 169, 109, 0.55);
    }
  }

  @keyframes loading-ripple {
    0% {
      opacity: 0;
      transform: scale(0.42);
    }
    28% {
      opacity: 0.8;
    }
    100% {
      opacity: 0;
      transform: scale(1.28);
    }
  }

  @keyframes loading-line-move {
    0% {
      transform: translateX(-52px);
    }
    50% {
      transform: translateX(75px);
    }
    100% {
      transform: translateX(150px);
    }
  }

  @keyframes ripple-field-one {
    from {
      transform: translate3d(-3%, -2%, 0) scale(0.94) rotate(-2deg);
    }
    to {
      transform: translate3d(4%, 3%, 0) scale(1.08) rotate(3deg);
    }
  }

  @keyframes ripple-field-two {
    from {
      transform: translate3d(4%, 2%, 0) scale(1.06) rotate(2deg);
    }
    to {
      transform: translate3d(-4%, -3%, 0) scale(0.92) rotate(-3deg);
    }
  }

  @keyframes page-ripple {
    0% {
      opacity: 0;
      transform: scale(0.22);
    }
    14% {
      opacity: 0.52;
    }
    72% {
      opacity: 0.2;
    }
    100% {
      opacity: 0;
      transform: scale(2.6);
    }
  }

  @keyframes card-water-rings {
    from {
      transform: rotate(-18deg) scale(1.35) translate3d(-2%, 2%, 0);
    }
    to {
      transform: rotate(-18deg) scale(1.48) translate3d(3%, -4%, 0);
    }
  }

  @keyframes card-water-flow {
    from {
      transform: translate3d(-9%, 5%, 0) rotate(-9deg) scale(0.94);
    }
    to {
      transform: translate3d(7%, -10%, 0) rotate(12deg) scale(1.14);
    }
  }
</style>

<style lang="less">
  html.index-scrollbar-hidden,
  body.index-scrollbar-hidden {
    scrollbar-width: none;
  }

  html.index-scrollbar-hidden::-webkit-scrollbar,
  body.index-scrollbar-hidden::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
  }
</style>
