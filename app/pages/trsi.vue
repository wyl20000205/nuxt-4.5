<template>
  <div
    id="pages_trsi"
    :class="{
      'is-looking': isEyesLooking,
      'is-running': isBrandRunning,
    }"
  >
    <div class="t1">
      <p class="p1"></p>
      <p class="p2"></p>
      <p class="p3"></p>
      <p class="p4"></p>
      <p class="p5"></p>
      <p class="p6"></p>
      <p class="p7"></p>
      <p class="p8"></p>
      <p class="p9"></p>
      <i class="trsi_eye eye_left" aria-hidden="true"></i>
      <i class="trsi_eye eye_right" aria-hidden="true"></i>
    </div>
    <p class="test_j">J</p>
    <p class="test_iuyin">iuYin</p>
  </div>
</template>

<script lang="ts" setup>
  let router = useRouter();
  let isEyesLooking = ref(false);
  let isBrandRunning = ref(false);
  let eyesTimer: ReturnType<typeof setTimeout>;
  let brandTimer: ReturnType<typeof setTimeout>;
  let redirectTimer: ReturnType<typeof setTimeout>;

  onMounted(() => {
    eyesTimer = setTimeout(() => {
      isEyesLooking.value = true;
    }, 3800);

    brandTimer = setTimeout(() => {
      isEyesLooking.value = false;
      isBrandRunning.value = true;
    }, 5300);

    redirectTimer = setTimeout(() => {
      router.push("/");
    }, 8700);
  });

  onBeforeUnmount(() => {
    clearTimeout(eyesTimer);
    clearTimeout(brandTimer);
    clearTimeout(redirectTimer);
  });
</script>

<style lang="less">
  #pages_trsi {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100vh;
    overflow: hidden;
    .t1 {
      position: absolute;
      width: 130px;
      height: 130px;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: repeat(3, 1fr);
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      gap: 5px;
      animation:
        container-finish 3.8s ease-in-out forwards,
        reveal-t1-shadow 0.18s 2.394s ease-out forwards;

      > p {
        position: relative;
        --entrance-duration: 2.8s;
        --entrance-delay: 0.3s;
        margin: 0;
        background: #04c648;
        animation-name: var(--entrance);
        animation-duration: var(--entrance-duration);
        animation-delay: var(--entrance-delay);
        animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
        animation-fill-mode: both;
      }

      .p1 {
        --entrance: return-from-top;
      }
      .p2 {
        --entrance: return-from-top-late;
      }
      .p3 {
        --entrance: return-from-right;
      }
      .p4 {
        --entrance: return-from-left;
      }
      .p5 {
        --entrance: drop-to-center;
        --entrance-duration: 2.2s;
        --entrance-delay: 0s;
        box-shadow: 5px 6px 12px rgb(0 72 26 / 18%);
      }
      .p6 {
        --entrance: return-from-right-late;
      }
      .p7 {
        --entrance: return-from-bottom;
      }
      .p8 {
        --entrance: return-from-bottom-late;
      }
      .p9 {
        --entrance: return-from-right-last;
      }

      .trsi_eye {
        position: absolute;
        top: 30px;
        z-index: 3;
        width: 15px;
        height: 38px;
        border-radius: 100px;
        background: #fff;
        box-shadow: 0 2px 3px rgb(0 72 26 / 12%);
        opacity: 0;
        transform: scale(0.65);
      }

      .eye_left {
        left: 37px;
      }

      .eye_right {
        right: 37px;
      }
    }
    .test_j {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(calc(-50% - 500px), -50%);
      font-size: 110px;
      color: white;
      font-weight: 900;
      opacity: 0;
      z-index: 1;
    }
    .test_iuyin {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(calc(-50% + 400px), -50%);
      color: white;
      font-size: 110px;
      opacity: 0;
    }

    &.is-looking {
      .t1 {
        .eye_left {
          animation: trsi-eye-look-left 1.5s
            cubic-bezier(0.36, 0.01, 0.2, 1) forwards;
        }

        .eye_right {
          animation: trsi-eye-look-right 1.5s
            cubic-bezier(0.36, 0.01, 0.2, 1) forwards;
        }
      }
    }

    &.is-running {
      .t1 {
        gap: 0;
        border-radius: 50%;
        overflow: hidden;
        box-shadow: 7px 8px 16px rgb(0 72 26 / 16%);
        animation:
          settle-t1 0.8s 0.65s cubic-bezier(0.16, 0.84, 0.44, 1) both,
          final-expand 1.8s 1.45s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;

        > p {
          animation: fade-grid-p 0.2s 2.25s ease-out forwards;
        }
      }

      .test_j {
        animation:
          show-test-j 0.65s cubic-bezier(0.16, 0.84, 0.44, 1) forwards,
          darken-test-j 0.8s 0.65s ease forwards,
          fade-copy 0.75s 1.45s ease-in forwards;
      }

      .test_iuyin {
        animation:
          settle-iuyin 0.8s 0.65s cubic-bezier(0.16, 0.84, 0.44, 1) forwards,
          fade-copy 0.75s 1.45s ease-in forwards;
      }
    }
  }

  @keyframes drop-to-center {
    0% {
      transform: translateY(0) rotate(0) scale(1);
      opacity: 0;
      animation-timing-function: cubic-bezier(0.12, 0.82, 0.22, 1);
    }
    30% {
      transform: translateY(-200px) rotate(0) scale(1);
      opacity: 1;
      animation-timing-function: cubic-bezier(0.55, 0.055, 0.675, 0.19);
    }
    52% {
      transform: translateY(0) rotate(-360deg) scale(1);
      opacity: 1;
      animation-timing-function: cubic-bezier(0.16, 0.84, 0.44, 1);
    }
    62% {
      transform: translateY(-150px) rotate(-360deg) scale(1);
      opacity: 1;
      animation-timing-function: cubic-bezier(0.55, 0.055, 0.675, 0.19);
    }
    72% {
      transform: translateY(7px) rotate(-360deg) scale(1.08, 0.92);
      opacity: 1;
      animation-timing-function: cubic-bezier(0.16, 0.84, 0.44, 1);
    }
    75% {
      transform: translateY(-6px) rotate(-360deg) scale(0.98, 1.02);
      opacity: 1;
    }
    78%,
    100% {
      transform: translateY(0) rotate(-360deg) scale(1);
      opacity: 1;
    }
  }

  @keyframes container-finish {
    0%,
    58% {
      transform: translate(-50%, -50%) rotate(0);
      gap: 5px;
      border-radius: 0;
      overflow: visible;
    }
    70% {
      transform: translate(-50%, -50%) rotate(0);
      gap: 0;
      border-radius: 0;
      overflow: visible;
    }
    80% {
      transform: translate(-50%, -50%) rotate(360deg);
      gap: 0;
      border-radius: 50%;
      overflow: hidden;
    }
    84%,
    100% {
      transform: translate(calc(-50% - 150px), -50%) rotate(360deg);
      gap: 0;
      border-radius: 50%;
      overflow: hidden;
    }
  }

  @keyframes reveal-t1-shadow {
    0% {
      box-shadow: 0 0 0 rgb(0 72 26 / 0%);
    }
    100% {
      box-shadow: 7px 8px 16px rgb(0 72 26 / 16%);
    }
  }

  @keyframes show-test-j {
    0% {
      opacity: 0;
      transform: translate(calc(-50% - 500px), -50%);
    }
    1% {
      opacity: 1;
      transform: translate(calc(-50% - 500px), -50%);
    }
    100% {
      opacity: 1;
      transform: translate(calc(-50% - 150px), -50%);
    }
  }

  @keyframes settle-t1 {
    0% {
      width: 130px;
      height: 130px;
      transform: translate(calc(-50% - 150px), -50%) rotate(360deg);
    }
    100% {
      width: 40px;
      height: 40px;
      transform: translate(calc(-50% + 135px), calc(-50% + 35px)) rotate(360deg);
    }
  }

  @keyframes darken-test-j {
    0% {
      color: white;
    }
    100% {
      color: black;
    }
  }

  @keyframes settle-iuyin {
    0% {
      color: white;
      opacity: 0;
      transform: translate(calc(-50% + 400px), -50%);
    }
    100% {
      color: black;
      opacity: 1;
      transform: translate(calc(-50%), -50%);
    }
  }

  @keyframes trsi-eye-look-left {
    0% {
      opacity: 0;
      transform: translate(-3px, 3px) scale(0.65);
    }
    12% {
      opacity: 1;
      transform: translate(-3px, 0) scale(1);
    }
    34% {
      opacity: 1;
      transform: translate(-8px, -3px) scale(1);
    }
    58% {
      opacity: 1;
      transform: translate(7px, -2px) scale(1);
    }
    78% {
      opacity: 1;
      transform: translate(3px, 4px) scale(1);
    }
    100% {
      opacity: 0;
      transform: translate(0, 0) scale(0.82);
    }
  }

  @keyframes trsi-eye-look-right {
    0% {
      opacity: 0;
      transform: translate(-3px, 3px) scale(0.65);
    }
    12% {
      opacity: 1;
      transform: translate(-3px, 0) scale(1);
    }
    34% {
      opacity: 1;
      transform: translate(-8px, -3px) scale(1);
    }
    58% {
      opacity: 1;
      transform: translate(7px, -2px) scale(1);
    }
    78% {
      opacity: 1;
      transform: translate(3px, 4px) scale(1);
    }
    100% {
      opacity: 0;
      transform: translate(0, 0) scale(0.82);
    }
  }

  @keyframes fade-copy {
    0% {
      color: black;
      opacity: 1;
    }
    100% {
      color: rgb(0 0 0 / 0%);
      opacity: 0;
    }
  }

  @keyframes fade-grid-p {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }

  @keyframes final-expand {
    0%,
    25% {
      width: 40px;
      height: 40px;
      transform: translate(calc(-50% + 135px), calc(-50% + 35px)) rotate(360deg);
      background: #04c648;
      border-radius: 50%;
      gap: 0;
      overflow: hidden;
      z-index: 2;
      opacity: 1;
      box-shadow: 7px 8px 16px rgb(0 72 26 / 16%);
    }
    45%,
    55% {
      width: 40px;
      height: 40px;
      transform: translate(-50%, -50%) rotate(360deg);
      background: #04c648;
      border-radius: 50%;
      gap: 0;
      overflow: hidden;
      z-index: 2;
      opacity: 1;
      box-shadow: 7px 8px 16px rgb(0 72 26 / 16%);
    }
    100% {
      width: 160vmax;
      height: 160vmax;
      transform: translate(-50%, -50%) rotate(360deg);
      background: #04c648;
      border-radius: 50%;
      gap: 0;
      overflow: hidden;
      z-index: 2;
      opacity: 0;
      box-shadow: 0 0 0 rgb(0 72 26 / 0%);
    }
  }

  @keyframes return-from-top {
    0%,
    42% {
      transform: translateY(-360px);
      opacity: 0;
    }
    76%,
    100% {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes return-from-right {
    0%,
    42% {
      transform: translateX(360px);
      opacity: 0;
    }
    76%,
    100% {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes return-from-right-late {
    0%,
    45% {
      transform: translateX(360px);
      opacity: 0;
    }
    79%,
    100% {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes return-from-right-last {
    0%,
    48% {
      transform: translateX(360px);
      opacity: 0;
    }
    82%,
    100% {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes return-from-bottom {
    0%,
    42% {
      transform: translateY(360px);
      opacity: 0;
    }
    76%,
    100% {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes return-from-bottom-late {
    0%,
    45% {
      transform: translateY(360px);
      opacity: 0;
    }
    79%,
    100% {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes return-from-left {
    0%,
    42% {
      transform: translateX(-360px);
      opacity: 0;
    }
    76%,
    100% {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes return-from-top-late {
    0%,
    45% {
      transform: translateY(-360px);
      opacity: 0;
    }
    79%,
    100% {
      transform: translateY(0);
      opacity: 1;
    }
  }
</style>
