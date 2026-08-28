<script setup>
import qrcode from "qrcode";
import apiIndex from "~/composables/api_index";

const amountOptions = ["0.01", "0.10", "0.50", "1.00"];
const selectedAmount = ref("0.01");
const customAmount = ref("");
const qrImage = ref("");
const paymentUrl = ref("");
const tradeNo = ref("");
const loading = ref(false);
const querying = ref(false);
const paid = ref(false);
const message = ref("选择金额后生成支付宝二维码");
let pollingTimer = null;

const paymentAmount = computed(() => {
  const custom = Number(customAmount.value);
  return customAmount.value && custom > 0
    ? custom.toFixed(2)
    : selectedAmount.value;
});

const stopPolling = () => {
  if (pollingTimer) clearInterval(pollingTimer);
  pollingTimer = null;
};

const resetPayment = () => {
  stopPolling();
  qrImage.value = "";
  paymentUrl.value = "";
  tradeNo.value = "";
  paid.value = false;
  message.value = "金额已更新，请重新生成二维码";
};

const selectAmount = (amount) => {
  selectedAmount.value = amount;
  customAmount.value = "";
  resetPayment();
};

const handleCustomAmount = () => {
  if (Number(customAmount.value) > 0) selectedAmount.value = "";
  resetPayment();
};

const queryPayment = async () => {
  if (!tradeNo.value || querying.value || paid.value) return;
  querying.value = true;
  try {
    const result = await apiIndex.pay("demo_query", { trade: tradeNo.value });
    if (result?.code === "10000" && result?.tradeStatus === "TRADE_SUCCESS") {
      paid.value = true;
      message.value = `¥${paymentAmount.value} 支付成功`;
      stopPolling();
      return;
    }
    if (result?.code !== "10000" && result?.subCode !== "ACQ.TRADE_NOT_EXIST") {
      message.value = result?.subMsg || result?.msg || "支付状态查询失败";
    }
  } catch {
    message.value = "支付状态查询失败，请稍后重试";
  } finally {
    querying.value = false;
  }
};

const startPolling = () => {
  stopPolling();
  pollingTimer = setInterval(queryPayment, 2500);
};

const generateQr = async () => {
  const amount = Number(paymentAmount.value);
  if (!Number.isFinite(amount) || amount < 0.01) {
    message.value = "支付金额不能小于 ¥0.01";
    return;
  }

  loading.value = true;
  resetPayment();
  message.value = "正在创建支付宝订单";
  try {
    const result = await apiIndex.pay("pay", { price: amount.toFixed(2) });
    if (result?.code !== "10000" || !result?.qrCode || !result?.outTradeNo) {
      message.value = result?.subMsg || result?.msg || "支付宝订单创建失败";
      return;
    }

    paymentUrl.value = result.qrCode;
    tradeNo.value = result.outTradeNo;
    qrImage.value = await qrcode.toDataURL(result.qrCode, {
      width: 360,
      margin: 1,
      errorCorrectionLevel: "M",
    });
    message.value = "请使用支付宝扫描二维码，页面会自动确认结果";
    startPolling();
  } catch {
    message.value = "支付请求失败，请检查服务端配置";
  } finally {
    loading.value = false;
  }
};

const finishPayment = () => queryPayment();

const openAlipay = () => {
  if (!paymentUrl.value) {
    message.value = "请先生成支付二维码";
    return;
  }
  window.location.href = paymentUrl.value;
};

onBeforeUnmount(stopPolling);
</script>

<template>
  <main id="pages_alipay">
    <section class="payment_card">
      <header>
        <h1>支付宝支付</h1>
        <p>请选择支付金额</p>
      </header>

      <div class="amount_box">
        <button
          v-for="amount in amountOptions"
          :key="amount"
          :class="{ active: !customAmount && selectedAmount === amount }"
          type="button"
          @click="selectAmount(amount)"
        >
          ¥{{ amount }}
        </button>
        <label :class="{ active: customAmount }">
          <span>¥</span>
          <input
            v-model="customAmount"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="自定义金额"
            maxlength="6"
            @input="handleCustomAmount"
          />
        </label>
      </div>

      <div class="payment_info">
        <p class="amount_label">支付金额</p>
        <p class="amount">¥{{ paymentAmount }}</p>
        <p class="img_qr" :class="{ hidden: !qrImage, paid }">
          <img v-if="qrImage" :src="qrImage" alt="支付宝支付二维码" />
          <span v-else>二维码待生成</span>
        </p>
        <p v-if="tradeNo" class="trade_no">订单号：{{ tradeNo }}</p>
        <p class="message" :class="{ success: paid }">{{ message }}</p>
      </div>

      <div class="actions">
        <button
          class="secondary desktop_action"
          type="button"
          :disabled="!tradeNo || querying"
          @click="finishPayment"
        >
          {{ querying ? "查询中" : "查询支付结果" }}
        </button>
        <button class="primary" type="button" :disabled="loading" @click="generateQr">
          {{ loading ? "正在生成" : "生成支付二维码" }}
        </button>
        <button class="primary mobile_action" type="button" @click="openAlipay">
          唤起支付宝应用
        </button>
      </div>
    </section>
  </main>
</template>

<style lang="less">
#pages_alipay {
  &,
  * {
    box-sizing: border-box;
  }

  display: grid;
  min-height: 100vh;
  padding: 24px;
  color: #334155;
  background: #f7f8fa;
  place-items: center;

  button,
  input {
    font: inherit;
  }

  .payment_card {
    width: min(430px, 100%);
    padding: 30px;
    border: 1px solid #e8ecf1;
    border-radius: 16px;
    background: #fff;
    box-shadow: 0 18px 50px rgba(183, 188, 200, 0.08);
  }

  header {
    text-align: center;

    h1 {
      color: #172033;
      font-size: 22px;
    }

    p {
      margin-top: 7px;
      color: #94a3b8;
      font-size: 13px;
    }
  }

  .amount_box {
    display: grid;
    margin-top: 24px;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 9px;

    button,
    label {
      height: 40px;
      border: 1px solid #dfe3e8;
      border-radius: 8px;
      color: #64748b;
      background: #fff;
    }

    button {
      cursor: pointer;
    }

    .active {
      border-color: #1677ff;
      color: #1677ff;
      background: #f0f7ff;
    }

    label {
      display: flex;
      grid-column: 1 / -1;
      align-items: center;
      padding: 0 12px;

      input {
        min-width: 0;
        height: 100%;
        border: 0;
        outline: 0;
        padding-left: 7px;
        flex: 1;
        color: #334155;
        background: transparent;
      }
    }
  }

  .payment_info {
    margin-top: 24px;
    text-align: center;

    .amount_label {
      color: #94a3b8;
      font-size: 12px;
    }

    .amount {
      margin-top: 4px;
      color: #172033;
      font-size: 30px;
      font-weight: 700;
    }

    .img_qr {
      display: grid;
      width: 190px;
      height: 190px;
      padding: 8px;
      border: 1px solid #e2e8f0;
      margin: 17px auto 0;
      border-radius: 11px;
      color: #94a3b8;
      background: #fff;
      font-size: 13px;
      place-items: center;

      &.hidden {
        border-style: dashed;
        background: #fafbfc;
      }

      &.paid {
        border-color: #22c55e;
      }

      img {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }

    .message {
      min-height: 20px;
      margin-top: 14px;
      color: #64748b;
      font-size: 13px;

      &.success {
        color: #16a34a;
        font-weight: 600;
      }
    }

    .trade_no {
      margin-top: 12px;
      overflow: hidden;
      color: #94a3b8;
      font-family: monospace;
      font-size: 11px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .actions {
    display: grid;
    margin-top: 20px;
    grid-template-columns: 1fr 1fr;
    gap: 9px;

    button {
      height: 42px;
      border-radius: 8px;
      cursor: pointer;

      &:disabled {
        cursor: not-allowed;
        opacity: 0.55;
      }
    }

    .primary {
      border: 1px solid #1677ff;
      color: #fff;
      background: #1677ff;
    }

    .secondary {
      border: 1px solid #dfe3e8;
      color: #475569;
      background: #fff;
    }

    .mobile_action {
      display: none;
    }
  }

  .demo_tip {
    margin-top: 18px;
    color: #a3adbd;
    font-size: 12px;
    text-align: center;
  }
}

@media (max-width: 640px) {
  #pages_alipay {
    padding: 14px;
    background: #fff;

    .payment_card {
      padding: 24px 18px;
      border: 0;
      box-shadow: none;
    }

    .actions {
      grid-template-columns: 1fr;

      .desktop_action {
        display: none;
      }

      .mobile_action {
        display: block;
      }
    }
  }
}
</style>
