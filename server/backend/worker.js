import { defineWebSocketHandler } from "h3";
import {
  ensureGameTable,
  getOrCreatePlayer,
  getPlayer,
  settleGame,
  transferCoins,
} from "./doudizhu_store.js";
import {
  beats,
  createDeck,
  identifyPattern,
  patternLabel,
  shuffle,
  sortCards,
} from "./doudizhu_rules.js";

const channel = "doudizhu-public";
const room = createRoom();
const disconnectTimers = new Map();
const allowedOrigins = new Set(
  (process.env.WS_ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
);

ensureGameTable().catch((error) => {
  console.error(`[doudizhu table error] ${error.message}`);
});

export default defineWebSocketHandler({
  upgrade(request) {
    const origin = request.headers.get("origin");
    if (allowedOrigins.size > 0 && origin && !allowedOrigins.has(origin)) {
      return new Response("Origin not allowed", { status: 403 });
    }
  },

  open(peer) {
    peer.context.game = { messageCount: 0, rateWindowStartedAt: Date.now() };
    peer.subscribe(channel);
    send(peer, {
      type: "hello",
      clientId: peer.id,
      message: "斗地主服务已连接",
    });
  },

  async message(peer, message) {
    if (!consumeRateLimit(peer)) return sendError(peer, "操作太频繁，请稍后再试");

    let payload;
    try {
      payload = JSON.parse(message.text());
    } catch {
      return sendError(peer, "消息格式无效");
    }

    try {
      if (payload.type === "ping") return send(peer, { type: "pong", requestId: payload.requestId });
      if (payload.type === "join") return await joinRoom(peer, payload);
      if (payload.type === "refresh-balance") return await refreshBalance(peer);
      if (payload.type === "transfer") return await changeTableCoins(peer, payload);
      if (payload.type === "ready") return await toggleReady(peer);
      if (payload.type === "play") return await playCards(peer, payload.cardIds);
      if (payload.type === "pass") return passTurn(peer);
      sendError(peer, "暂不支持该操作");
    } catch (error) {
      console.error(`[doudizhu action error] ${error.message}`);
      sendError(peer, publicError(error));
    }
  },

  close(peer) {
    const player = playerByPeer(peer.id);
    if (!player) return;
    player.connected = false;
    player.peerId = null;
    player.peerRef = null;
    player.ready = false;
    broadcastState(peer);

    clearTimeout(disconnectTimers.get(player.playerKey));
    if (room.status !== "playing") {
      disconnectTimers.set(
        player.playerKey,
        setTimeout(() => removeDisconnectedPlayer(player.playerKey), 60_000),
      );
    }
  },

  error(peer, error) {
    console.error(`[doudizhu websocket error] ${peer.id}: ${error.message}`);
  },
});

async function joinRoom(peer, payload) {
  const playerKey = normalizePlayerKey(payload.playerKey);
  const nickname = normalizeText(payload.nickname, 24) || "牌友";
  if (!playerKey) throw new Error("玩家标识无效，请刷新页面重试");

  const existing = room.players.find((item) => item.playerKey === playerKey);
  let player;
  if (existing) {
    player = existing;
    if (existing.peerRef && existing.peerId !== peer.id) {
      sendError(existing.peerRef, "该玩家已在另一个页面重新连接");
    }
  } else {
    if (room.players.length >= 3) throw new Error("牌桌已满，请稍后重试");
    player = {
      playerKey,
      nickname,
      peerId: peer.id,
      peerRef: peer,
      connected: true,
      ready: false,
      seat: nextSeat(),
      hand: [],
      role: null,
      walletCoins: 0,
      tableCoins: 0,
    };
    room.players.push(player);
  }

  clearTimeout(disconnectTimers.get(playerKey));
  disconnectTimers.delete(playerKey);
  const account = await getOrCreatePlayer(playerKey, nickname);
  Object.assign(player, {
    nickname: account.nickname,
    peerId: peer.id,
    peerRef: peer,
    connected: true,
    walletCoins: account.walletCoins,
    tableCoins: account.tableCoins,
  });
  peer.context.game.playerKey = playerKey;
  room.notice = room.players.length === 3
    ? "三名玩家已入座，请各自准备"
    : `已入座 ${room.players.length} 人，还需 ${3 - room.players.length} 人`;
  send(peer, { type: "joined", playerKey });
  broadcastState(peer);
}

async function refreshBalance(peer) {
  const player = requirePlayer(peer);
  const account = await getPlayer(player.playerKey);
  if (account) {
    player.walletCoins = account.walletCoins;
    player.tableCoins = account.tableCoins;
  }
  broadcastState(peer);
}

async function changeTableCoins(peer, payload) {
  const player = requirePlayer(peer);
  if (room.status === "playing") throw new Error("对局中不能上下分");
  const direction = payload.direction === "down" ? "down" : "up";
  const account = await transferCoins(player.playerKey, direction, payload.amount);
  player.walletCoins = account.walletCoins;
  player.tableCoins = account.tableCoins;
  player.ready = false;
  room.notice = `${player.nickname}${direction === "up" ? "上分" : "下分"}成功`;
  broadcastState(peer);
}

async function toggleReady(peer) {
  const player = requirePlayer(peer);
  if (room.status === "playing") throw new Error("对局已经开始");
  if (!player.ready && player.tableCoins < 200) throw new Error("牌桌金币至少需要 200");
  player.ready = !player.ready;
  room.notice = player.ready ? `${player.nickname}已准备` : `${player.nickname}取消准备`;
  broadcastState(peer);

  if (
    room.players.length === 3 &&
    room.players.every((item) => item.connected && item.ready)
  ) {
    startGame(peer);
  }
}

function startGame(peer) {
  const deck = shuffle(createDeck());
  room.status = "playing";
  room.lastPlay = null;
  room.passCount = 0;
  room.winnerKey = null;
  room.settlement = null;
  room.bottom = deck.slice(51);

  const landlord = room.players[Math.floor(Math.random() * room.players.length)];
  room.landlordKey = landlord.playerKey;
  room.currentTurn = landlord.playerKey;
  room.players.forEach((player, index) => {
    player.hand = sortCards(deck.slice(index * 17, index * 17 + 17));
    player.role = player.playerKey === landlord.playerKey ? "landlord" : "farmer";
    player.ready = false;
  });
  landlord.hand = sortCards([...landlord.hand, ...room.bottom]);
  room.notice = `${landlord.nickname}成为地主并获得三张底牌`;
  broadcastState(peer);
}

async function playCards(peer, cardIds) {
  const player = requirePlayingPlayer(peer);
  if (room.currentTurn !== player.playerKey) throw new Error("还没有轮到你出牌");
  if (!Array.isArray(cardIds) || cardIds.length === 0) throw new Error("请选择要出的牌");

  const uniqueIds = [...new Set(cardIds)];
  if (uniqueIds.length !== cardIds.length) throw new Error("出牌数据重复");
  const cards = uniqueIds.map((id) => player.hand.find((card) => card.id === id));
  if (cards.some((card) => !card)) throw new Error("所选牌不在手牌中");

  const nextPattern = identifyPattern(cards);
  if (!nextPattern) throw new Error("所选牌不符合斗地主牌型");
  if (room.lastPlay && room.lastPlay.playerKey !== player.playerKey) {
    if (!beats(nextPattern, room.lastPlay.pattern)) throw new Error("这组牌压不过上一手");
  }

  const selected = new Set(uniqueIds);
  player.hand = player.hand.filter((card) => !selected.has(card.id));
  room.lastPlay = {
    playerKey: player.playerKey,
    nickname: player.nickname,
    cards: sortCards(cards),
    pattern: nextPattern,
  };
  room.passCount = 0;
  room.notice = `${player.nickname}打出${patternLabel(nextPattern.type)}`;

  if (player.hand.length === 0) return await finishGame(player, peer);
  room.currentTurn = nextPlayerKey(player.playerKey);
  broadcastState(peer);
}

function passTurn(peer) {
  const player = requirePlayingPlayer(peer);
  if (room.currentTurn !== player.playerKey) throw new Error("还没有轮到你操作");
  if (!room.lastPlay || room.lastPlay.playerKey === player.playerKey) {
    throw new Error("当前轮次必须出牌");
  }

  room.passCount += 1;
  room.notice = `${player.nickname}选择不出`;
  room.currentTurn = nextPlayerKey(player.playerKey);
  if (room.passCount >= 2) {
    room.lastPlay = null;
    room.passCount = 0;
    room.notice += "，开启新一轮";
  }
  broadcastState(peer);
}

async function finishGame(winner, peer) {
  const landlordWon = winner.role === "landlord";
  const changes = room.players.map((player) => ({
    playerKey: player.playerKey,
    delta: landlordWon
      ? player.role === "landlord" ? 200 : -100
      : player.role === "landlord" ? -200 : 100,
  }));
  await settleGame(changes);

  room.winnerKey = winner.playerKey;
  room.settlement = changes;
  room.status = "waiting";
  room.currentTurn = null;
  room.lastPlay = null;
  room.passCount = 0;
  room.notice = `${winner.nickname}获胜，金币已经结算`;
  room.players.forEach((player) => {
    const change = changes.find((item) => item.playerKey === player.playerKey);
    player.tableCoins += change.delta;
    player.hand = [];
    player.role = null;
    player.ready = false;
  });
  broadcastState(peer);
}

function createRoom() {
  return {
    status: "waiting",
    players: [],
    landlordKey: null,
    currentTurn: null,
    lastPlay: null,
    passCount: 0,
    bottom: [],
    winnerKey: null,
    settlement: null,
    notice: "等待三名玩家入座",
  };
}

function broadcastState(fallbackPeer) {
  const samplePeer = room.players.find((player) => player.peerRef)?.peerRef || fallbackPeer;
  if (!samplePeer) return;
  samplePeer.peers.forEach((peer) => {
    if (!peer.topics.has(channel)) return;
    send(peer, { type: "state", state: publicState(playerByPeer(peer.id)) });
  });
}

function publicState(self) {
  return {
    status: room.status,
    notice: room.notice,
    landlordKey: room.landlordKey,
    currentTurn: room.currentTurn,
    lastPlay: room.lastPlay,
    bottom: room.status === "playing" ? room.bottom : [],
    winnerKey: room.winnerKey,
    settlement: room.settlement,
    players: room.players.map((player) => ({
      playerKey: player.playerKey,
      nickname: player.nickname,
      connected: player.connected,
      ready: player.ready,
      seat: player.seat,
      role: player.role,
      cardCount: player.hand.length,
      tableCoins: player.tableCoins,
    })),
    self: self
      ? {
          playerKey: self.playerKey,
          walletCoins: self.walletCoins,
          tableCoins: self.tableCoins,
          hand: self.hand,
        }
      : null,
  };
}

function requirePlayer(peer) {
  const player = playerByPeer(peer.id);
  if (!player) throw new Error("请先加入牌桌");
  return player;
}

function requirePlayingPlayer(peer) {
  const player = requirePlayer(peer);
  if (room.status !== "playing") throw new Error("对局尚未开始");
  return player;
}

function playerByPeer(peerId) {
  return room.players.find((player) => player.peerId === peerId);
}

function nextPlayerKey(playerKey) {
  const ordered = [...room.players].sort((a, b) => a.seat - b.seat);
  const index = ordered.findIndex((player) => player.playerKey === playerKey);
  return ordered[(index + 1) % ordered.length].playerKey;
}

function nextSeat() {
  for (let seat = 0; seat < 3; seat += 1) {
    if (!room.players.some((player) => player.seat === seat)) return seat;
  }
  return 0;
}

function removeDisconnectedPlayer(playerKey) {
  const player = room.players.find((item) => item.playerKey === playerKey);
  if (player?.connected || room.status === "playing") return;
  room.players = room.players.filter((item) => item.playerKey !== playerKey);
  room.notice = "有空位可加入";
  disconnectTimers.delete(playerKey);
  broadcastState();
}

function send(peer, payload) {
  peer.send(JSON.stringify({ ...payload, timestamp: new Date().toISOString() }));
}

function sendError(peer, message) {
  send(peer, { type: "error", message });
}

function consumeRateLimit(peer) {
  const state = peer.context.game;
  const now = Date.now();
  if (!state || now - state.rateWindowStartedAt >= 10_000) {
    peer.context.game = { ...state, messageCount: 1, rateWindowStartedAt: now };
    return true;
  }
  state.messageCount += 1;
  return state.messageCount <= 40;
}

function normalizePlayerKey(value) {
  return typeof value === "string" && /^[a-zA-Z0-9_-]{8,64}$/.test(value) ? value : "";
}

function normalizeText(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function publicError(error) {
  const safeMessages = [
    "金币数量无效", "可用金币不足", "对局中不能上下分", "牌桌金币至少需要 200",
    "对局已经开始", "还没有轮到你出牌", "请选择要出的牌", "出牌数据重复",
    "所选牌不在手牌中", "所选牌不符合斗地主牌型", "这组牌压不过上一手",
    "还没有轮到你操作", "当前轮次必须出牌", "请先加入牌桌", "对局尚未开始",
    "牌桌已满，请稍后重试", "玩家标识无效，请刷新页面重试",
  ];
  return safeMessages.includes(error.message) ? error.message : "服务暂时不可用，请稍后重试";
}
