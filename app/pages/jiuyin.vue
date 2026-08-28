<template>
  <main id="pages_jiuyin">
    <header class="topbar">
      <div class="brand">
        <span class="brand_mark">斗</span>
        <div><strong>久引斗地主</strong><small>三人实时牌桌</small></div>
      </div>
      <div class="account_bar">
        <span class="connection" :class="socketStatus"><i></i>{{ statusText }}</span>
        <span class="coin"><i>●</i> 钱包 {{ walletCoins }}</span>
        <span class="coin"><i>●</i> 牌桌 {{ tableCoins }}</span>
        <button type="button" @click="scorePanelOpen = true">上下分</button>
        <button class="recharge" type="button" @click="openRecharge">充值 0.01 元</button>
      </div>
    </header>

    <section class="game_shell">
      <div class="felt">
        <div class="felt_texture"></div>

        <article
          v-for="(player, index) in opponents"
          :key="player.playerKey"
          class="player opponent"
          :class="[`opponent_${index}`, { active: state.currentTurn === player.playerKey }]"
        >
          <div class="avatar"><span>{{ player.nickname.slice(0, 1) }}</span></div>
          <div class="player_info">
            <strong>{{ player.nickname }}</strong>
            <span>{{ roleLabel(player.role) }} · {{ player.tableCoins }} 金币</span>
            <em v-if="player.ready">已准备</em>
            <em v-else-if="!player.connected" class="offline">已离线</em>
          </div>
          <div v-if="state.status === 'playing'" class="card_stack">
            <i></i><i></i><b>{{ player.cardCount }}</b>
          </div>
        </article>

        <div class="bottom_cards" :class="{ visible: state.bottom.length }">
          <span>地主底牌</span>
          <div>
            <GameCard v-for="card in state.bottom" :key="card.id" :card="card" mini />
          </div>
        </div>

        <section class="table_center">
          <div v-if="state.lastPlay" class="last_play">
            <small>{{ state.lastPlay.nickname }} · {{ patternName(state.lastPlay.pattern?.type) }}</small>
            <div>
              <GameCard v-for="card in state.lastPlay.cards" :key="card.id" :card="card" small />
            </div>
          </div>
          <div v-else class="table_notice">
            <span class="seal">久引</span>
            <strong>{{ state.notice }}</strong>
            <small v-if="state.status === 'waiting'">三人准备后自动开局，每局基础输赢 100 金币</small>
          </div>
        </section>

        <div v-if="state.winnerKey && state.status === 'waiting'" class="settlement">
          <strong>{{ winnerName }} 获胜</strong>
          <span>{{ settlementText }}</span>
        </div>

        <section class="self_area" :class="{ active: isMyTurn }">
          <div class="self_identity">
            <div class="avatar"><span>{{ nickname.slice(0, 1) }}</span></div>
            <div>
              <strong>{{ nickname }} <em>我</em></strong>
              <span>{{ roleLabel(selfPlayer?.role) }} · {{ tableCoins }} 金币</span>
            </div>
          </div>

          <div v-if="state.status === 'playing'" class="hand" aria-label="我的手牌">
            <button
              v-for="card in state.self?.hand || []"
              :key="card.id"
              type="button"
              :class="{ selected: selectedIds.includes(card.id) }"
              @click="toggleCard(card.id)"
            >
              <GameCard :card="card" />
            </button>
          </div>
          <div v-else class="waiting_hand">
            <span v-for="index in 12" :key="index"></span>
          </div>

          <div class="actions">
            <template v-if="state.status === 'playing'">
              <button class="ghost" type="button" :disabled="!canPass" @click="passTurn">不出</button>
              <button class="primary" type="button" :disabled="!isMyTurn || !selectedIds.length" @click="playCards">
                出牌 <span v-if="selectedIds.length">{{ selectedIds.length }}</span>
              </button>
            </template>
            <button v-else class="primary ready" type="button" :disabled="!joined" @click="toggleReady">
              {{ selfPlayer?.ready ? "取消准备" : tableCoins < 200 ? "准备 · 需 200 金币" : "准备" }}
            </button>
          </div>
        </section>
      </div>
    </section>

    <Transition name="toast"><div v-if="toast" class="toast">{{ toast }}</div></Transition>

    <div v-if="scorePanelOpen" class="modal_backdrop" @click.self="scorePanelOpen = false">
      <section class="modal score_modal">
        <button class="close" type="button" @click="scorePanelOpen = false">×</button>
        <p class="eyebrow">金币管理</p>
        <h2>牌桌上下分</h2>
        <div class="balance_grid">
          <p><span>钱包金币</span><strong>{{ walletCoins }}</strong></p>
          <p><span>牌桌金币</span><strong>{{ tableCoins }}</strong></p>
        </div>
        <label class="amount_field">
          <span>金币数量</span>
          <input v-model.number="transferAmount" type="number" min="1" max="1000000" step="100" />
        </label>
        <div class="quick_amounts">
          <button v-for="amount in [100, 200, 500, 1000]" :key="amount" type="button" @click="transferAmount = amount">{{ amount }}</button>
        </div>
        <div class="modal_actions">
          <button type="button" :disabled="state.status === 'playing'" @click="transfer('down')">下分到钱包</button>
          <button class="primary" type="button" :disabled="state.status === 'playing'" @click="transfer('up')">上分到牌桌</button>
        </div>
        <small>对局期间暂停上下分。开局要求牌桌金币不少于 200。</small>
      </section>
    </div>

    <div v-if="rechargeOpen" class="modal_backdrop" @click.self="closeRecharge">
      <section class="modal recharge_modal">
        <button class="close" type="button" @click="closeRecharge">×</button>
        <p class="eyebrow">支付宝充值</p>
        <h2>充值 1000 金币</h2>
        <div class="price"><span>¥</span>0.01</div>
        <p class="limit_tip">本牌桌单次最高充值金额为 0.01 元</p>
        <div class="qr_box" :class="{ empty: !qrImage }">
          <img v-if="qrImage" :src="qrImage" alt="支付宝充值二维码" />
          <span v-else>{{ paymentLoading ? "正在创建订单" : "点击下方按钮生成二维码" }}</span>
        </div>
        <p class="payment_message">{{ paymentMessage }}</p>
        <button class="primary payment_button" type="button" :disabled="paymentLoading || paymentPaid" @click="createPayment">
          {{ paymentPaid ? "充值已到账" : paymentLoading ? "处理中" : qrImage ? "重新生成" : "生成支付二维码" }}
        </button>
      </section>
    </div>
  </main>
</template>

<script setup>
import { computed, defineComponent, h, onBeforeUnmount, onMounted, ref } from "vue";
import qrcode from "qrcode";
import apiIndex from "~/composables/api_index";

const GameCard = defineComponent({
  props: { card: { type: Object, required: true }, mini: Boolean, small: Boolean },
  setup(props) {
    return () => {
      const card = props.card;
      const joker = card.suit === "joker";
      const red = card.suit === "b" || card.suit === "c" || card.rank === 17;
      return h("span", { class: ["game_card", { mini: props.mini, small: props.small, red, joker }] }, [
        h("b", rankLabel(card.rank)),
        joker
          ? h("i", card.rank === 17 ? "大王" : "小王")
          : h("img", { src: `/images/${card.suit}.png`, alt: suitName(card.suit) }),
      ]);
    };
  },
});

const socketStatus = ref("connecting");
const state = ref(emptyState());
const selectedIds = ref([]);
const toast = ref("");
const scorePanelOpen = ref(false);
const transferAmount = ref(200);
const rechargeOpen = ref(false);
const qrImage = ref("");
const tradeNo = ref("");
const paymentLoading = ref(false);
const paymentPaid = ref(false);
const paymentMessage = ref("固定金额充值，到账后自动增加金币");
const joined = ref(false);

let socket;
let reconnectTimer;
let toastTimer;
let paymentTimer;
let reconnectAttempts = 0;
let pageClosed = false;
let playerKey = "";
let nickname = "";

const statusText = computed(() => ({ connecting: "连接中", open: "在线", closed: "重连中", error: "连接异常" })[socketStatus.value]);
const walletCoins = computed(() => state.value.self?.walletCoins || 0);
const tableCoins = computed(() => state.value.self?.tableCoins || 0);
const selfPlayer = computed(() => state.value.players.find((player) => player.playerKey === playerKey));
const opponents = computed(() => state.value.players.filter((player) => player.playerKey !== playerKey).sort((a, b) => a.seat - b.seat));
const isMyTurn = computed(() => state.value.status === "playing" && state.value.currentTurn === playerKey);
const canPass = computed(() => isMyTurn.value && state.value.lastPlay && state.value.lastPlay.playerKey !== playerKey);
const winnerName = computed(() => state.value.players.find((player) => player.playerKey === state.value.winnerKey)?.nickname || "本局玩家");
const settlementText = computed(() => {
  const own = state.value.settlement?.find((item) => item.playerKey === playerKey);
  return own ? `本局金币 ${own.delta > 0 ? "+" : ""}${own.delta}` : "本局结算完成";
});

onMounted(() => {
  playerKey = localStorage.getItem("jiuyinPlayerKey") || createPlayerKey();
  nickname = localStorage.getItem("jiuyinNickname") || `牌友${playerKey.slice(-4).toUpperCase()}`;
  localStorage.setItem("jiuyinPlayerKey", playerKey);
  localStorage.setItem("jiuyinNickname", nickname);
  connect();
});

onBeforeUnmount(() => {
  pageClosed = true;
  clearTimeout(reconnectTimer);
  clearTimeout(toastTimer);
  clearInterval(paymentTimer);
  socket?.close(1000, "Page closed");
});

function connect() {
  clearTimeout(reconnectTimer);
  socketStatus.value = "connecting";
  const protocol = location.protocol === "https:" ? "wss:" : "ws:";
  const activeSocket = new WebSocket(`${protocol}//${location.host}/ws`);
  socket = activeSocket;

  activeSocket.addEventListener("open", () => {
    if (socket !== activeSocket) return;
    socketStatus.value = "open";
    reconnectAttempts = 0;
    send({ type: "join", playerKey, nickname });
  });
  activeSocket.addEventListener("message", (event) => handleMessage(event.data));
  activeSocket.addEventListener("error", () => { socketStatus.value = "error"; });
  activeSocket.addEventListener("close", () => {
    if (socket !== activeSocket) return;
    socket = null;
    joined.value = false;
    socketStatus.value = "closed";
    if (!pageClosed) {
      reconnectAttempts += 1;
      reconnectTimer = setTimeout(connect, Math.min(1000 * 2 ** (reconnectAttempts - 1), 10_000));
    }
  });
}

function handleMessage(raw) {
  let payload;
  try { payload = JSON.parse(raw); } catch { return; }
  if (payload.type === "joined") joined.value = true;
  if (payload.type === "state") {
    state.value = payload.state;
    const validIds = new Set(payload.state.self?.hand?.map((card) => card.id) || []);
    selectedIds.value = selectedIds.value.filter((id) => validIds.has(id));
  }
  if (payload.type === "error") showToast(payload.message);
}

function send(payload) {
  if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify(payload));
  else showToast("正在重新连接牌桌");
}

function toggleCard(cardId) {
  if (!isMyTurn.value) return;
  selectedIds.value = selectedIds.value.includes(cardId)
    ? selectedIds.value.filter((id) => id !== cardId)
    : [...selectedIds.value, cardId];
}

function playCards() {
  send({ type: "play", cardIds: selectedIds.value });
}

function passTurn() {
  selectedIds.value = [];
  send({ type: "pass" });
}

function toggleReady() {
  if (!selfPlayer.value?.ready && tableCoins.value < 200) {
    scorePanelOpen.value = true;
    showToast("牌桌金币不足 200，请先充值并上分");
    return;
  }
  send({ type: "ready" });
}

function transfer(direction) {
  const amount = Number(transferAmount.value);
  if (!Number.isSafeInteger(amount) || amount < 1) return showToast("请输入有效的金币数量");
  send({ type: "transfer", direction, amount });
}

function openRecharge() {
  rechargeOpen.value = true;
  paymentMessage.value = "固定金额充值，到账后自动增加金币";
}

function closeRecharge() {
  rechargeOpen.value = false;
  clearInterval(paymentTimer);
}

async function createPayment() {
  paymentLoading.value = true;
  paymentPaid.value = false;
  qrImage.value = "";
  tradeNo.value = "";
  clearInterval(paymentTimer);
  paymentMessage.value = "正在创建 0.01 元充值订单";
  try {
    const result = await apiIndex.pay("pay", {
      price: "0.01",
      purpose: "doudizhu",
      playerKey,
      nickname,
    });
    if (result?.code !== "10000" || !result?.qrCode || !result?.outTradeNo) {
      throw new Error(result?.subMsg || result?.msg || "订单创建失败");
    }
    tradeNo.value = result.outTradeNo;
    qrImage.value = await qrcode.toDataURL(result.qrCode, { width: 320, margin: 1, errorCorrectionLevel: "M" });
    paymentMessage.value = "请使用支付宝扫码，支付结果会自动确认";
    paymentTimer = setInterval(queryPayment, 2500);
  } catch (error) {
    paymentMessage.value = error?.response?.data?.data?.msg || error.message || "支付服务暂时不可用";
  } finally {
    paymentLoading.value = false;
  }
}

async function queryPayment() {
  if (!tradeNo.value || paymentPaid.value) return;
  try {
    const result = await apiIndex.pay("game_query", { trade: tradeNo.value, playerKey, nickname });
    if (result?.code === "10000" && result?.tradeStatus === "TRADE_SUCCESS") {
      paymentPaid.value = true;
      paymentMessage.value = result.gameCredit?.credited ? "充值成功，1000 金币已到账" : "该订单已经到账";
      clearInterval(paymentTimer);
      send({ type: "refresh-balance" });
    }
  } catch {
    paymentMessage.value = "支付状态查询失败，正在继续尝试";
  }
}

function showToast(message) {
  toast.value = message;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.value = ""; }, 2600);
}

function emptyState() {
  return { status: "waiting", notice: "正在进入牌桌", players: [], self: null, bottom: [], lastPlay: null, settlement: null };
}

function createPlayerKey() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function rankLabel(rank) {
  return ({ 11: "J", 12: "Q", 13: "K", 14: "A", 15: "2", 16: "J", 17: "J" })[rank] || String(rank);
}

function suitName(suit) {
  return ({ a: "黑桃", b: "红桃", c: "方块", d: "梅花" })[suit] || "";
}

function roleLabel(role) {
  return role === "landlord" ? "地主" : role === "farmer" ? "农民" : "等待开局";
}

function patternName(type) {
  return ({ single: "单牌", pair: "对子", triple: "三张", triple_single: "三带一", triple_pair: "三带二", straight: "顺子", pair_straight: "连对", airplane: "飞机", airplane_single: "飞机带单", airplane_pair: "飞机带对", four_two_single: "四带二", four_two_pair: "四带两对", bomb: "炸弹", rocket: "王炸" })[type] || "出牌";
}
</script>

<style lang="less">
#pages_jiuyin {
  --gold: #f1c168;
  --gold-dark: #8e5b19;
  --ink: #22180f;
  min-width: 920px;
  min-height: 100vh;
  color: #fff8e9;
  background: #11100d;
  box-sizing: border-box;

  &, * { box-sizing: border-box; }
  button, input { font: inherit; }

  .topbar {
    display: flex;
    height: 74px;
    align-items: center;
    justify-content: space-between;
    padding: 0 30px;
    border-bottom: 1px solid rgba(241, 193, 104, .18);
    background: rgba(21, 18, 13, .98);
  }

  .brand { display: flex; align-items: center; gap: 12px; }
  .brand_mark {
    display: grid; width: 42px; height: 42px; place-items: center;
    color: #2a1908; border-radius: 50%; background: linear-gradient(145deg, #ffe7a8, #c4832c);
    font-size: 23px; font-weight: 900; box-shadow: 0 0 25px rgba(235, 176, 72, .2);
  }
  .brand strong, .brand small { display: block; }
  .brand strong { font-size: 19px; letter-spacing: .08em; }
  .brand small { margin-top: 3px; color: #9f927e; font-size: 11px; }

  .account_bar { display: flex; align-items: center; gap: 10px; color: #c7baa4; font-size: 13px; }
  .account_bar > span { padding: 9px 12px; border: 1px solid #332c22; border-radius: 8px; background: #1d1914; }
  .account_bar .coin i { margin-right: 5px; color: var(--gold); }
  .account_bar button { height: 36px; padding: 0 14px; border: 1px solid #56442b; border-radius: 8px; color: #ead8b8; background: #2a2117; cursor: pointer; }
  .account_bar .recharge { border-color: #b17a31; color: #2c1c09; background: linear-gradient(135deg, #f8d58c, #c68a35); font-weight: 800; }
  .connection i { display: inline-block; width: 7px; height: 7px; margin-right: 6px; border-radius: 50%; background: #b24b3d; }
  .connection.open i { background: #55bd78; box-shadow: 0 0 0 3px rgba(85, 189, 120, .12); }

  .game_shell { min-height: calc(100vh - 74px); padding: 22px 26px 28px; }
  .felt {
    position: relative; width: min(1420px, 100%); height: calc(100vh - 124px); min-height: 680px; margin: auto; overflow: hidden;
    border: 5px solid #49351d; border-radius: 42% / 18%;
    background: radial-gradient(ellipse at center, #27624f 0%, #184839 58%, #0c2f26 100%);
    box-shadow: inset 0 0 0 2px #8c6630, inset 0 0 90px rgba(0,0,0,.5), 0 18px 50px rgba(0,0,0,.45);
  }
  .felt_texture { position: absolute; inset: 0; opacity: .18; background-image: repeating-linear-gradient(35deg, transparent 0 5px, rgba(255,255,255,.025) 5px 6px); pointer-events: none; }

  .player { position: absolute; z-index: 4; display: flex; align-items: center; gap: 11px; }
  .opponent_0 { top: 115px; left: 6%; }
  .opponent_1 { top: 115px; right: 6%; flex-direction: row-reverse; text-align: right; }
  .avatar { display: grid; width: 58px; height: 58px; padding: 3px; border: 1px solid #a67838; border-radius: 50%; background: #2b2116; place-items: center; }
  .avatar span { display: grid; width: 100%; height: 100%; place-items: center; border-radius: 50%; color: #43280d; background: linear-gradient(145deg, #f6d795, #b67729); font-size: 22px; font-weight: 900; }
  .player.active .avatar { box-shadow: 0 0 0 5px rgba(244, 198, 103, .18), 0 0 24px rgba(244, 198, 103, .35); }
  .player_info strong, .player_info span { display: block; }
  .player_info strong { font-size: 15px; }
  .player_info span { margin-top: 4px; color: #c2b294; font-size: 11px; }
  .player_info em { display: inline-block; margin-top: 6px; padding: 3px 7px; border-radius: 4px; color: #bff3cc; background: rgba(61, 135, 79, .38); font-size: 10px; }
  .player_info em.offline { color: #e5a59d; background: rgba(120, 45, 36, .4); }
  .card_stack { position: relative; width: 48px; height: 58px; margin: 0 6px; }
  .card_stack i { position: absolute; width: 36px; height: 50px; border: 2px solid #d8ad5f; border-radius: 5px; background: repeating-linear-gradient(45deg, #531b16 0 4px, #7b2b22 4px 8px); box-shadow: 0 2px 5px rgba(0,0,0,.4); }
  .card_stack i:nth-child(2) { left: 7px; top: 4px; }
  .card_stack b { position: absolute; right: -4px; bottom: -1px; min-width: 22px; padding: 3px 5px; border-radius: 10px; color: #39220b; background: var(--gold); font-size: 11px; text-align: center; }

  .bottom_cards { position: absolute; z-index: 3; top: 28px; left: 50%; opacity: .28; transform: translateX(-50%); text-align: center; }
  .bottom_cards.visible { opacity: 1; }
  .bottom_cards > span { display: block; margin-bottom: 6px; color: #d7c4a3; font-size: 10px; letter-spacing: .15em; }
  .bottom_cards > div, .last_play > div { display: flex; justify-content: center; gap: 5px; }

  .table_center { position: absolute; z-index: 3; top: 44%; left: 50%; width: 500px; min-height: 130px; transform: translate(-50%, -50%); text-align: center; }
  .table_notice { display: flex; align-items: center; flex-direction: column; }
  .table_notice .seal { display: grid; width: 68px; height: 68px; margin-bottom: 13px; place-items: center; border: 1px solid rgba(238, 196, 112, .45); border-radius: 50%; color: rgba(248, 218, 157, .72); font-size: 19px; box-shadow: inset 0 0 0 5px rgba(238, 196, 112, .05); }
  .table_notice strong { color: #f0ddbc; font-size: 15px; font-weight: 500; }
  .table_notice small { margin-top: 7px; color: #86aa99; font-size: 11px; }
  .last_play small { display: block; margin-bottom: 10px; color: #e1c896; font-size: 11px; }

  .self_area { position: absolute; z-index: 5; right: 8%; bottom: 72px; left: 8%; min-height: 220px; }
  .self_identity { position: absolute; bottom: 0; left: 0; display: flex; align-items: center; gap: 10px; }
  .self_identity strong, .self_identity span { display: block; }
  .self_identity strong em { padding: 2px 4px; border-radius: 3px; color: #433018; background: #dcb262; font-size: 9px; }
  .self_identity span { margin-top: 4px; color: #baa98c; font-size: 11px; }
  .self_area.active .self_identity .avatar { box-shadow: 0 0 0 5px rgba(244, 198, 103, .18), 0 0 24px rgba(244, 198, 103, .35); }

  .hand { position: absolute; right: 160px; bottom: 0; left: 160px; display: flex; justify-content: center; align-items: flex-end; height: 175px; }
  .hand button { position: relative; width: 38px; height: 142px; padding: 0; border: 0; background: transparent; cursor: pointer; transition: width .12s ease, transform .12s ease; }
  .hand button:last-child { width: 78px; }
  .hand button.selected { transform: translateY(-24px); }
  .hand button.selected .game_card { box-shadow: 0 0 0 3px #f2bf5b, 0 9px 18px rgba(0,0,0,.38); }
  .waiting_hand { position: absolute; right: 180px; bottom: 4px; left: 180px; display: flex; justify-content: center; opacity: .32; }
  .waiting_hand span { width: 38px; height: 130px; margin-left: -8px; border: 2px solid #d4ac63; border-radius: 7px; background: repeating-linear-gradient(45deg, #481712 0 5px, #70271f 5px 10px); }

  .actions { position: absolute; right: 0; bottom: 0; display: flex; gap: 8px; }
  .actions button, .modal_actions button, .payment_button { height: 42px; padding: 0 22px; border: 1px solid #79613d; border-radius: 8px; color: #ead9ba; background: rgba(31, 25, 17, .86); cursor: pointer; font-weight: 700; }
  button.primary { border-color: #d2a24f; color: #34200b; background: linear-gradient(135deg, #f7db99, #bd7e29); }
  button:disabled { cursor: not-allowed; opacity: .38; }

  .game_card { position: absolute; inset: 0 auto auto 0; display: block; width: 76px; height: 136px; padding: 8px; overflow: hidden; border: 1px solid #c9c1b4; border-radius: 8px; color: #171512; background: #fffdf7; box-shadow: 0 5px 12px rgba(0,0,0,.28); text-align: left; }
  .game_card b { display: block; font-family: Georgia, serif; font-size: 25px; line-height: 1; }
  .game_card img { display: block; width: 20px; height: 20px; margin-top: 5px; object-fit: contain; }
  .game_card.red { color: #d92b22; }
  .game_card.joker { padding: 7px 5px; }
  .game_card.joker i { position: absolute; top: 33px; left: 9px; width: 18px; color: inherit; font-size: 14px; line-height: 1.05; }
  .game_card.small { position: relative; width: 55px; height: 98px; padding: 6px; }
  .game_card.small b { font-size: 19px; }
  .game_card.small img { width: 15px; height: 15px; }
  .game_card.small.joker i { top: 27px; left: 7px; font-size: 11px; }
  .game_card.mini { position: relative; width: 39px; height: 58px; padding: 4px; border-radius: 4px; }
  .game_card.mini b { font-size: 14px; }
  .game_card.mini img { width: 11px; height: 11px; margin-top: 2px; }
  .game_card.mini.joker i { top: 19px; left: 5px; font-size: 8px; }

  .settlement { position: absolute; z-index: 8; top: 20%; left: 50%; min-width: 300px; padding: 16px 24px; border: 1px solid rgba(241,193,104,.45); border-radius: 12px; background: rgba(18,16,12,.9); transform: translateX(-50%); text-align: center; box-shadow: 0 15px 45px rgba(0,0,0,.35); }
  .settlement strong, .settlement span { display: block; }
  .settlement strong { color: #f3cf83; font-size: 18px; }
  .settlement span { margin-top: 6px; color: #c8b99e; font-size: 12px; }

  .toast { position: fixed; z-index: 30; top: 92px; left: 50%; padding: 11px 18px; border: 1px solid #795d35; border-radius: 8px; color: #f3dfba; background: rgba(28,22,15,.96); transform: translateX(-50%); box-shadow: 0 10px 25px rgba(0,0,0,.25); font-size: 13px; }
  .toast-enter-active, .toast-leave-active { transition: .2s ease; }
  .toast-enter-from, .toast-leave-to { opacity: 0; transform: translate(-50%, -8px); }

  .modal_backdrop { position: fixed; z-index: 40; inset: 0; display: grid; padding: 24px; background: rgba(4,4,3,.72); backdrop-filter: blur(7px); place-items: center; }
  .modal { position: relative; width: min(410px, 100%); padding: 30px; border: 1px solid #5c482e; border-radius: 16px; color: #e9dac0; background: #191611; box-shadow: 0 25px 80px rgba(0,0,0,.55); }
  .modal .close { position: absolute; top: 13px; right: 14px; width: 32px; height: 32px; border: 0; color: #9f917c; background: transparent; cursor: pointer; font-size: 25px; }
  .modal .eyebrow { color: #c79448; font-size: 10px; font-weight: 800; letter-spacing: .16em; }
  .modal h2 { margin-top: 7px; color: #fff3da; font-size: 23px; }
  .balance_grid { display: grid; margin-top: 22px; grid-template-columns: 1fr 1fr; gap: 10px; }
  .balance_grid p { padding: 14px; border: 1px solid #352d22; border-radius: 9px; background: #211c16; }
  .balance_grid span, .balance_grid strong { display: block; }
  .balance_grid span { color: #9d917e; font-size: 11px; }
  .balance_grid strong { margin-top: 5px; color: #efc874; font-size: 20px; }
  .amount_field { display: block; margin-top: 16px; }
  .amount_field span { display: block; margin-bottom: 7px; color: #afa18a; font-size: 11px; }
  .amount_field input { width: 100%; height: 44px; padding: 0 12px; border: 1px solid #443725; border-radius: 8px; color: #f5dfb7; background: #100e0b; }
  .quick_amounts { display: grid; margin-top: 8px; grid-template-columns: repeat(4, 1fr); gap: 6px; }
  .quick_amounts button { height: 31px; border: 1px solid #3b3124; border-radius: 6px; color: #b9aa91; background: #211c16; cursor: pointer; font-size: 11px; }
  .modal_actions { display: grid; margin-top: 18px; grid-template-columns: 1fr 1fr; gap: 8px; }
  .score_modal > small { display: block; margin-top: 14px; color: #7f7565; font-size: 10px; line-height: 1.6; }
  .recharge_modal { text-align: center; }
  .recharge_modal .price { margin-top: 17px; color: #f0c36e; font-family: Georgia, serif; font-size: 40px; font-weight: 800; }
  .recharge_modal .price span { margin-right: 3px; font-size: 19px; }
  .limit_tip { margin-top: 2px; color: #9b8c75; font-size: 11px; }
  .qr_box { display: grid; width: 190px; height: 190px; margin: 18px auto 0; padding: 8px; border: 1px solid #4b3b26; border-radius: 11px; background: #fff; place-items: center; }
  .qr_box.empty { border-style: dashed; color: #847967; background: #211c16; font-size: 11px; }
  .qr_box img { width: 100%; height: 100%; object-fit: contain; }
  .payment_message { min-height: 18px; margin-top: 13px; color: #a99a82; font-size: 11px; }
  .payment_button { width: 100%; margin-top: 12px; }
}

@media (max-height: 800px) {
  #pages_jiuyin .felt { min-height: 620px; }
  #pages_jiuyin .self_area { bottom: 58px; }
  #pages_jiuyin .opponent_0, #pages_jiuyin .opponent_1 { top: 90px; }
}
</style>
