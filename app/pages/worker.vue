<template>
  <main id="pages_worker">
    <section class="socket_panel">
      <header class="panel_header">
        <div>
          <p class="eyebrow">REMOTE WEBSOCKET DEMO</p>
          <h1>实时消息测试台</h1>
          <p class="description">
            在不同设备上打开此页面并连接同一个服务地址，即可测试远程双向通信。
          </p>
        </div>

        <div class="connection_state" :class="status">
          <span class="state_dot"></span>
          <strong>{{ statusLabel }}</strong>
        </div>
      </header>

      <div class="connection_form">
        <label class="url_field">
          <span>WebSocket 地址</span>
          <input
            v-model.trim="socketUrl"
            type="url"
            spellcheck="false"
            placeholder="ws://your-server.example:8081/ws"
            :disabled="isBusy || isConnected"
            @keydown.enter="connect"
          />
          <small> 默认与 Nuxt 共用域名和端口，WebSocket 路径为 /ws。 </small>
        </label>

        <label class="name_field">
          <span>昵称</span>
          <input
            v-model.trim="nickname"
            type="text"
            maxlength="24"
            placeholder="Anonymous"
          />
        </label>

        <button
          v-if="!isConnected"
          class="primary_button"
          type="button"
          :disabled="isBusy"
          @click="connect"
        >
          {{ isBusy ? "连接中" : "连接" }}
        </button>
        <button v-else class="danger_button" type="button" @click="disconnect">
          断开
        </button>
      </div>

      <div class="connection_meta">
        <span
          >在线客户端 <strong>{{ onlineCount }}</strong></span
        >
        <span
          >客户端 ID <code>{{ shortClientId }}</code></span
        >
        <label>
          <input v-model="autoReconnect" type="checkbox" />
          断线自动重连
        </label>
      </div>

      <section ref="messageList" class="message_list" aria-live="polite">
        <div v-if="messages.length === 0" class="empty_state">
          <div class="signal_icon"><i></i><i></i><i></i></div>
          <strong>等待连接</strong>
          <span>连接成功后，服务消息与聊天内容会显示在这里。</span>
        </div>

        <article
          v-for="message in messages"
          :key="message.id"
          class="message_item"
          :class="message.kind"
        >
          <div class="message_head">
            <strong>{{ message.author }}</strong>
            <time>{{ message.time }}</time>
          </div>
          <p>{{ message.text }}</p>
        </article>
      </section>

      <form class="composer" @submit.prevent="sendMessage">
        <textarea
          v-model="draft"
          rows="2"
          maxlength="1000"
          placeholder="输入消息，按 Enter 发送，Shift + Enter 换行"
          :disabled="!isConnected"
          @keydown.enter.exact.prevent="sendMessage"
        ></textarea>

        <div class="composer_actions">
          <span>{{ draft.length }} / 1000</span>
          <button
            class="secondary_button"
            type="button"
            :disabled="!isConnected"
            @click="testDatabase"
          >
            测试 MySQL
          </button>
          <button
            class="secondary_button"
            type="button"
            :disabled="!isConnected"
            @click="sendPing"
          >
            测试延迟
          </button>
          <button class="primary_button" type="submit" :disabled="!canSend">
            发送
          </button>
        </div>
      </form>
    </section>
  </main>
</template>

<script setup>
  import { computed, nextTick, onBeforeUnmount, onMounted } from "vue";

  const socketUrl = ref("");
  const nickname = ref("Anonymous");
  const status = ref("idle");
  const clientId = ref("");
  const onlineCount = ref(0);
  const draft = ref("");
  const messages = ref([]);
  const autoReconnect = ref(true);
  const messageList = ref(null);

  let socket = null;
  let reconnectTimer = null;
  let reconnectAttempts = 0;
  let manuallyClosed = false;
  const pingRequests = new Map();

  const isConnected = computed(() => status.value === "open");
  const isBusy = computed(() => status.value === "connecting");
  const canSend = computed(
    () => isConnected.value && draft.value.trim().length > 0,
  );
  const shortClientId = computed(() =>
    clientId.value ? clientId.value.slice(0, 8) : "未分配",
  );
  const statusLabel = computed(
    () =>
      ({
        idle: "未连接",
        connecting: "连接中",
        open: "已连接",
        closed: "已断开",
        error: "连接异常",
      })[status.value],
  );

  onMounted(() => {
    socketUrl.value = normalizeClientUrl(
      localStorage.getItem("workerNitroSocketUrl") || createDefaultSocketUrl(),
    );
    nickname.value = localStorage.getItem("workerSocketName") || "Anonymous";
  });

  onBeforeUnmount(() => {
    manuallyClosed = true;
    clearTimeout(reconnectTimer);
    socket?.close(1000, "Page closed");
  });

  function createDefaultSocketUrl() {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${window.location.host}/ws`;
  }

  function connect() {
    if (isBusy.value || isConnected.value) return;

    let parsedUrl;

    try {
      parsedUrl = new URL(socketUrl.value);
      if (!["ws:", "wss:"].includes(parsedUrl.protocol)) throw new Error();
    } catch {
      addSystemMessage(
        "地址无效，请使用 ws:// 或 wss:// 开头的完整地址。",
        "error",
      );
      return;
    }

    clearTimeout(reconnectTimer);
    manuallyClosed = false;
    status.value = "connecting";
    localStorage.setItem("workerNitroSocketUrl", parsedUrl.href);
    localStorage.setItem("workerSocketName", nickname.value || "Anonymous");

    const activeSocket = new WebSocket(parsedUrl.href);
    socket = activeSocket;

    activeSocket.addEventListener("open", () => {
      if (socket !== activeSocket) return;
      status.value = "open";
      reconnectAttempts = 0;
      addSystemMessage(`已连接 ${parsedUrl.href}`);
    });

    activeSocket.addEventListener("message", (event) => {
      if (socket !== activeSocket) return;
      handleServerMessage(event.data);
    });

    activeSocket.addEventListener("error", () => {
      if (socket !== activeSocket) return;
      status.value = "error";
      addSystemMessage(
        "连接发生错误，请检查服务地址、端口与 TLS 配置。",
        "error",
      );
    });

    activeSocket.addEventListener("close", (event) => {
      if (socket !== activeSocket) return;
      socket = null;
      clientId.value = "";
      onlineCount.value = 0;
      status.value = "closed";
      addSystemMessage(`连接已关闭，状态码 ${event.code}。`);

      if (!manuallyClosed && autoReconnect.value) scheduleReconnect();
    });
  }

  function disconnect() {
    manuallyClosed = true;
    clearTimeout(reconnectTimer);
    socket?.close(1000, "User disconnected");
  }

  function scheduleReconnect() {
    clearTimeout(reconnectTimer);
    reconnectAttempts += 1;
    const delay = Math.min(1000 * 2 ** (reconnectAttempts - 1), 10_000);

    addSystemMessage(
      `${delay / 1000} 秒后尝试第 ${reconnectAttempts} 次重连。`,
    );
    reconnectTimer = setTimeout(connect, delay);
  }

  function sendMessage() {
    const text = draft.value.trim();
    if (!text || socket?.readyState !== WebSocket.OPEN) return;

    socket.send(
      JSON.stringify({
        type: "message",
        name: nickname.value.trim() || "Anonymous",
        text,
      }),
    );
    draft.value = "";
  }

  function sendPing() {
    if (socket?.readyState !== WebSocket.OPEN) return;

    const requestId = createId();
    pingRequests.set(requestId, performance.now());
    socket.send(JSON.stringify({ type: "ping", requestId }));
  }

  function testDatabase() {
    if (socket?.readyState !== WebSocket.OPEN) return;

    const requestId = createId();
    socket.send(JSON.stringify({ type: "database-ping", requestId }));
    addSystemMessage(
      "正在通过 WebSocket 检查 Nuxt 进程中的 MySQL 连接池。",
      "system",
    );
  }

  function handleServerMessage(rawMessage) {
    let payload;

    try {
      payload = JSON.parse(rawMessage);
    } catch {
      addSystemMessage(`收到非 JSON 消息：${rawMessage}`, "error");
      return;
    }

    if (payload.type === "welcome") {
      clientId.value = payload.clientId;
      onlineCount.value = payload.online;
      return;
    }

    if (payload.type === "presence") {
      onlineCount.value = payload.online;
      return;
    }

    if (payload.type === "message") {
      addMessage({
        id: payload.id,
        kind: payload.clientId === clientId.value ? "outgoing" : "incoming",
        author:
          payload.clientId === clientId.value
            ? `${payload.name}（我）`
            : payload.name,
        text: payload.text,
        timestamp: payload.timestamp,
      });
      return;
    }

    if (payload.type === "pong") {
      const startedAt = pingRequests.get(payload.requestId);
      if (startedAt !== undefined) {
        addSystemMessage(
          `往返延迟约 ${Math.round(performance.now() - startedAt)} ms。`,
        );
        pingRequests.delete(payload.requestId);
      }
      return;
    }

    if (payload.type === "database-pong") {
      addSystemMessage(
        payload.ok
          ? `MySQL 连接正常，查询耗时 ${payload.duration} ms。`
          : `MySQL 连接异常：${payload.message}`,
        payload.ok ? "system" : "error",
      );
      return;
    }

    if (payload.type === "error") {
      addSystemMessage(payload.message, "error");
    }
  }

  function addSystemMessage(text, kind = "system") {
    addMessage({
      id: createId(),
      kind,
      author: kind === "error" ? "错误" : "系统",
      text,
      timestamp: new Date().toISOString(),
    });
  }

  function addMessage(message) {
    messages.value.push({
      ...message,
      time: new Intl.DateTimeFormat("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).format(new Date(message.timestamp)),
    });

    if (messages.value.length > 200) messages.value.shift();
    nextTick(() => {
      if (messageList.value) {
        messageList.value.scrollTop = messageList.value.scrollHeight;
      }
    });
  }

  function createId() {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();

    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function normalizeClientUrl(value) {
    try {
      const url = new URL(value);

      if (url.hostname === "0.0.0.0" || url.port === "8081") {
        return createDefaultSocketUrl();
      }

      return url.href;
    } catch {
      return value;
    }
  }
</script>

<style lang="less" scoped>
  #pages_worker {
    --ink: #172033;
    --muted: #667085;
    --line: #dfe4ec;
    --accent: #3867f4;
    min-height: 100vh;
    padding: 48px 20px;
    color: var(--ink);
    background:
      radial-gradient(
        circle at 15% 5%,
        rgba(71, 115, 255, 0.15),
        transparent 34%
      ),
      radial-gradient(
        circle at 85% 95%,
        rgba(45, 202, 167, 0.13),
        transparent 32%
      ),
      #f4f6fa;
    box-sizing: border-box;

    * {
      box-sizing: border-box;
    }
  }

  .socket_panel {
    width: min(980px, 100%);
    margin: 0 auto;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.94);
    border: 1px solid rgba(255, 255, 255, 0.9);
    border-radius: 22px;
    box-shadow: 0 24px 70px rgba(31, 48, 86, 0.12);
    backdrop-filter: blur(12px);
  }

  .panel_header {
    display: flex;
    justify-content: space-between;
    gap: 32px;
    padding: 32px 34px 26px;

    .eyebrow {
      margin: 0 0 8px;
      color: var(--accent);
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.14em;
    }

    h1 {
      margin: 0;
      font-size: clamp(28px, 4vw, 42px);
      line-height: 1.15;
    }

    .description {
      margin: 12px 0 0;
      color: var(--muted);
      line-height: 1.7;
    }
  }

  .connection_state {
    display: flex;
    align-items: center;
    align-self: flex-start;
    flex: 0 0 auto;
    gap: 8px;
    padding: 9px 13px;
    color: #596273;
    background: #f0f2f6;
    border-radius: 999px;
    font-size: 13px;

    .state_dot {
      width: 9px;
      height: 9px;
      background: #98a2b3;
      border-radius: 50%;
    }

    &.connecting .state_dot {
      background: #f5a524;
      animation: pulse 1s infinite;
    }

    &.open {
      color: #087a5b;
      background: #e8f8f3;

      .state_dot {
        background: #12a77d;
        box-shadow: 0 0 0 4px rgba(18, 167, 125, 0.13);
      }
    }

    &.error {
      color: #b42318;
      background: #fff0ee;

      .state_dot {
        background: #e5484d;
      }
    }
  }

  .connection_form {
    display: grid;
    grid-template-columns: minmax(280px, 1fr) minmax(140px, 220px) 100px;
    align-items: end;
    gap: 12px;
    padding: 22px 34px;
    background: #f8f9fc;
    border-top: 1px solid #edf0f5;
    border-bottom: 1px solid #edf0f5;

    label > span {
      display: block;
      margin-bottom: 8px;
      color: #475467;
      font-size: 13px;
      font-weight: 700;
    }

    label > small {
      display: block;
      margin-top: 7px;
      color: #7b8495;
      font-size: 12px;
      line-height: 1.45;
    }

    input {
      width: 100%;
      height: 44px;
      padding: 0 13px;
      color: var(--ink);
      background: #fff;
      border: 1px solid #d7dce5;
      border-radius: 10px;
      outline: none;
      transition: 0.2s ease;

      &:focus {
        border-color: var(--accent);
        box-shadow: 0 0 0 3px rgba(56, 103, 244, 0.12);
      }

      &:disabled {
        color: #8b93a4;
        background: #f0f2f6;
      }
    }
  }

  button {
    height: 44px;
    padding: 0 18px;
    border: 0;
    border-radius: 10px;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
    transition:
      transform 0.18s ease,
      opacity 0.18s ease,
      background 0.18s ease;

    &:hover:not(:disabled) {
      transform: translateY(-1px);
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.45;
    }
  }

  .primary_button {
    color: #fff;
    background: var(--accent);
  }

  .danger_button {
    color: #b42318;
    background: #feeceb;
  }

  .secondary_button {
    color: #344054;
    background: #edf0f5;
  }

  .connection_meta {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 24px;
    padding: 14px 34px;
    color: var(--muted);
    border-bottom: 1px solid #edf0f5;
    font-size: 13px;

    strong,
    code {
      color: var(--ink);
    }

    label {
      display: flex;
      align-items: center;
      gap: 7px;
      margin-left: auto;
      cursor: pointer;
    }

    input {
      accent-color: var(--accent);
    }
  }

  .message_list {
    height: min(47vh, 460px);
    min-height: 310px;
    padding: 24px 34px;
    overflow-y: auto;
    scroll-behavior: smooth;
  }

  .empty_state {
    display: flex;
    min-height: 100%;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    color: #98a2b3;
    text-align: center;

    strong {
      margin: 16px 0 5px;
      color: #667085;
    }
  }

  .signal_icon {
    display: flex;
    height: 42px;
    align-items: flex-end;
    gap: 5px;

    i {
      width: 7px;
      background: #aebeff;
      border-radius: 5px;

      &:nth-child(1) {
        height: 14px;
      }
      &:nth-child(2) {
        height: 26px;
      }
      &:nth-child(3) {
        height: 40px;
      }
    }
  }

  .message_item {
    width: fit-content;
    max-width: min(75%, 640px);
    margin: 0 0 16px;
    padding: 11px 14px;
    background: #f0f3f8;
    border-radius: 4px 14px 14px;

    .message_head {
      display: flex;
      gap: 14px;
      justify-content: space-between;
      margin-bottom: 5px;
      color: #536078;
      font-size: 12px;
    }

    time {
      color: #98a2b3;
    }

    p {
      margin: 0;
      overflow-wrap: anywhere;
      line-height: 1.55;
      white-space: pre-wrap;
    }

    &.outgoing {
      margin-left: auto;
      color: #fff;
      background: var(--accent);
      border-radius: 14px 4px 14px 14px;

      .message_head,
      time {
        color: rgba(255, 255, 255, 0.72);
      }
    }

    &.system,
    &.error {
      max-width: 100%;
      margin: 9px auto 15px;
      padding: 7px 12px;
      color: #667085;
      background: #f8f9fb;
      border-radius: 8px;
      font-size: 13px;

      .message_head {
        display: none;
      }
    }

    &.error {
      color: #b42318;
      background: #fff1ef;
    }
  }

  .composer {
    padding: 18px 34px 24px;
    background: #f8f9fc;
    border-top: 1px solid #edf0f5;

    textarea {
      display: block;
      width: 100%;
      min-height: 74px;
      padding: 13px 14px;
      resize: vertical;
      color: var(--ink);
      background: #fff;
      border: 1px solid #d7dce5;
      border-radius: 12px;
      font: inherit;
      line-height: 1.5;
      outline: none;

      &:focus {
        border-color: var(--accent);
        box-shadow: 0 0 0 3px rgba(56, 103, 244, 0.1);
      }
    }
  }

  .composer_actions {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 10px;
    margin-top: 12px;

    > span {
      margin-right: auto;
      color: #98a2b3;
      font-size: 12px;
    }
  }

  @keyframes pulse {
    50% {
      opacity: 0.35;
    }
  }

  @media (max-width: 760px) {
    #pages_worker {
      padding: 0;
    }

    .socket_panel {
      min-height: 100vh;
      border-radius: 0;
    }

    .panel_header {
      padding: 25px 20px 20px;
      flex-direction: column;
      gap: 18px;
    }

    .connection_form {
      grid-template-columns: 1fr 110px;
      padding: 18px 20px;

      .url_field {
        grid-column: 1 / -1;
      }
    }

    .connection_meta {
      padding: 13px 20px;

      label {
        width: 100%;
        margin-left: 0;
      }
    }

    .message_list {
      padding: 20px;
    }

    .message_item {
      max-width: 88%;
    }

    .composer {
      padding: 15px 20px 20px;
    }
  }
</style>
