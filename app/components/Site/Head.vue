<template>
  <div id="components_site_head" class="mb flex">
    <div class="flex">
      <div class="left flex">
        <button
          type="button"
          class="menu-trigger"
          :class="{ 'is-open': navi_index }"
          :aria-label="navi_index ? '关闭导航' : '打开导航'"
          :aria-expanded="Boolean(navi_index)"
          @click="slide_navigation"
        >
          <i class="i1"></i>
          <i class="i2"></i>
          <i class="i3"></i>
        </button>
      </div>
      <div class="right flex"><strong v-if="title">{{ title }}</strong></div>
    </div>
  </div>
  <Transition name="t1" mode="out-in">
    <div id="navigation" v-show="navi_index">
      <div class="back" @click="toggle_navi"></div>
      <div class="main flex" :class="{ open: panelOpen }">
        <p
          class="logo"
          :class="{ 'is-drawn': logoAnimated }"
          aria-label="HUALUO"
        >
          <svg
            viewBox="0 0 153 46"
            role="img"
            aria-hidden="true"
            focusable="false"
          >
            <text class="logo-text" x="10" y="29" transform="skewX(-8)">
              HUALUO
            </text>
            <path
              class="logo-line"
              d="M7 38 H132 L148 32"
              @animationend="logoAnimated = true"
            />
          </svg>
        </p>
        <p
          v-for="v in item_nav"
          v-show="v.display"
          :key="v.text"
          class="navigation_item mb-4 flex"
          :class="{ active: activeNavText === v.text }"
          @click="select_navigation(v.text)"
        >
          <em
            :class="['navigation_icon', 'yumao', v.icon]"
            aria-hidden="true"
          ></em>
          <em class="navigation_text">{{ v.text }}</em>
        </p>
      </div>
    </div>
  </Transition>
</template>

<script setup>
  import { throttle, useIndexStore } from "~/stores/index";

  const props = defineProps({
    items: { type: Array, default: undefined },
    title: { type: String, default: "" },
  });
  const emit = defineEmits(["select"]);
  const { item_nav: default_item_nav } = storeToRefs(useIndexStore());
  const item_nav = computed(() => props.items ?? default_item_nav.value);
  const title = computed(() => props.title);
  let navi_index = ref(0);
  let panelOpen = ref(false);
  let activeNavText = ref("首页");
  let logoAnimated = ref(false);
  let slide_navigation = throttle(() => {
    toggle_navi();
  }, 700);
  let select_navigation = (text) => {
    activeNavText.value = text;
    emit("select", text);
    toggle_navi(text);
  };
  let toggle_navi = throttle((text = "") => {
    if (navi_index.value) {
      setTimeout(() => {
        panelOpen.value = false;
        setTimeout(() => {
          navi_index.value = 0;
        }, 300);
      }, text ? 300 : 0);
    } else {
      navi_index.value = 1;
      nextTick(() => {
        requestAnimationFrame(() => {
          panelOpen.value = true;
        });
      });
    }
  }, 300);
</script>

<style lang="less">
  #components_site_head {
    position: fixed;
    z-index: 4;
    top: 0;
    left: 0;
    box-sizing: border-box;
    width: 100%;
    height: 58px;
    justify-content: center;
    align-items: center;
    margin-bottom: 15px;
    border-bottom: 1px solid rgb(237, 231, 231);
    background: #fff;
    > div {
      width: 85%;
      max-width: 1680px;
      height: 100%;
      > div {
        height: 100%;
        width: 50%;
      }
      .left {
        position: relative;
        align-items: center;
        > div {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
        }
        .menu-trigger {
          display: block;
          flex: 0 0 40px;
          width: 40px;
          height: 30px;
          margin: 0;
          padding: 0;
          border: 0;
          position: relative;
          overflow: visible;
          background: transparent;
          cursor: pointer;
        }
        i {
          display: block;
          position: absolute;
          top: 50%;
          left: 0;
          width: 100%;
          height: 2px;
          border-radius: 2px;
          background: gray;
          transform-origin: center;
          transition:
            opacity 0.2s,
            transform 0.2s;
        }
        .i1 {
          transform: translateY(-12px);
        }
        .i2 {
          transform: translateY(-1px);
        }
        .i3 {
          transform: translateY(10px);
        }
        .is-open {
          .i2 {
            opacity: 0;
            transform: translateY(-1px) scaleX(0);
          }
          .i1 {
            transform: translateY(-1px) rotate(45deg);
          }
          .i3 {
            transform: translateY(-1px) rotate(-45deg);
          }
        }
      }
      .right {
        justify-content: flex-end;
        align-items: center;
        color: #171717;
        font-size: 16px;
        p {
          cursor: pointer;
          margin-left: 40px;
          font-size: 20px;
        }
      }
    }
  }
  #navigation {
    position: fixed;
    z-index: 5;
    top: 0;
    width: 100vw;
    height: 100vh;
    > div {
      position: absolute;
      z-index: 3;
      top: 0;
      height: 100%;
    }
    .back {
      z-index: 1;
      width: 100%;
      background: rgba(189, 187, 187, 0.2);
    }
    .main {
      left: 0;
      z-index: 2;
      width: 180px;
      background: white;
      flex-direction: column;
      align-items: center;
      transform: translate3d(-100%, 0, 0);
      transition: transform 0.3s ease-out;
      will-change: transform;

      &.open {
        transform: translate3d(0, 0, 0);
      }

      .logo {
        width: min(180px, calc(100% - 64px));
        text-align: center;
      }

      .navigation_item {
        position: relative;
        align-items: center;
        gap: 16px;
        box-sizing: border-box;
        width: calc(100% - 32px);
        min-height: 34px;
        padding: 0 18px;
        border: 1px solid transparent;
        border-radius: 8px;
        color: #000;
        cursor: pointer;
        font-size: 17px;
        font-weight: 500;
        letter-spacing: 0.04em;
        text-align: left;
        transition:
          color 0.25s ease,
          background-color 0.25s ease,
          border-color 0.25s ease,
          transform 0.25s ease;

        .navigation_icon {
          display: inline-flex;
          flex: 0 0 24px;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          color: currentColor;
          font-family: "yumao" !important;
          font-size: 24px;
        }

        &:not(.active):hover {
          border-color: #f6f6f6;
          background: #f6f6f6;
          transform: translateX(2px);
        }

        &.active {
          border-color: #f0f0f0;
          color: #111;
          background: #f0f0f0;
          font-weight: 700;

          &::after {
            position: absolute;
            top: 50%;
            right: 14px;
            width: 5px;
            height: 5px;
            border-radius: 50%;
            background: #1d1d1f;
            box-shadow: 0 0 8px rgba(0, 0, 0, 0.25);
            content: "";
            transform: translateY(-50%);
          }
        }
      }
      .logo {
        height: 46px;
        margin: 60px 0;
        cursor: default;

        svg {
          display: block;
          width: 100%;
          height: 100%;
          overflow: visible;
        }

        .logo-text {
          fill: transparent;
          stroke: #111;
          stroke-width: 1;
          stroke-linejoin: round;
          stroke-dasharray: 340;
          stroke-dashoffset: 340;
          font-family: "Arial Black", Arial, sans-serif;
          font-size: 25px;
          font-style: italic;
          font-weight: 900;
          letter-spacing: 2.5px;
          paint-order: stroke fill;
          animation:
            mobile-logo-draw 1.8s cubic-bezier(0.65, 0, 0.35, 1) forwards,
            mobile-logo-fill 0.65s ease 1.35s forwards;
        }

        .logo-line {
          fill: none;
          stroke: #777;
          stroke-width: 1.2;
          stroke-linecap: round;
          stroke-dasharray: 150;
          stroke-dashoffset: 150;
          opacity: 0.7;
          transform: translateX(-5px);
          animation: mobile-logo-line-draw 0.75s ease 1.35s forwards;
        }

        &.is-drawn {
          .logo-text {
            fill: #111;
            stroke-width: 0.45;
            stroke-dashoffset: 0;
            animation: none;
          }

          .logo-line {
            stroke-dashoffset: 0;
            animation: none;
          }
        }
      }
    }
  }

  @keyframes mobile-logo-draw {
    to {
      stroke-dashoffset: 0;
    }
  }

  @keyframes mobile-logo-fill {
    to {
      fill: #111;
      stroke-width: 0.45;
    }
  }

  @keyframes mobile-logo-line-draw {
    to {
      stroke-dashoffset: 0;
    }
  }
</style>
