<script setup>
const suits = ["♠", "♥", "♣", "♦"];
const rankNames = {
  11: "J",
  12: "Q",
  13: "K",
  14: "A",
  16: "小王",
  17: "大王",
};
const playerNames = ["你", "西家", "搭档", "东家"];

const hands = ref([[], [], [], []]);
const selectedIds = ref([]);
const turn = ref(0);
const currentPlay = ref(null);
const passCount = ref(0);
const gameStatus = ref("ready");
const message = ref("点击开始，与你的对家并肩作战");
const lastActions = ref(["", "", "", ""]);
const winnerTeam = ref("");
let aiTimer;

const teamName = (playerIndex) => (playerIndex % 2 === 0 ? "蓝队" : "红队");

const createDeck = () => {
  const deck = [];
  let id = 0;
  for (let copy = 0; copy < 2; copy += 1) {
    for (const suit of suits) {
      for (let value = 2; value <= 14; value += 1) {
        deck.push({
          id: id++,
          suit,
          value,
          rank: rankNames[value] || String(value),
          red: suit === "♥" || suit === "♦",
        });
      }
    }
    deck.push({ id: id++, suit: "", value: 16, rank: "小王", red: false });
    deck.push({ id: id++, suit: "", value: 17, rank: "大王", red: true });
  }
  for (let index = deck.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [deck[index], deck[target]] = [deck[target], deck[index]];
  }
  return deck;
};

const sortCards = (cards) =>
  [...cards].sort(
    (a, b) => a.value - b.value || suits.indexOf(a.suit) - suits.indexOf(b.suit),
  );

const groupCards = (cards) => {
  const groups = new Map();
  for (const card of sortCards(cards)) {
    if (!groups.has(card.value)) groups.set(card.value, []);
    groups.get(card.value).push(card);
  }
  return groups;
};

const evaluateCards = (cards) => {
  if (!cards.length) return null;
  const sorted = sortCards(cards);
  const groups = groupCards(sorted);
  const values = [...groups.keys()].sort((a, b) => a - b);
  const counts = [...groups.values()].map((group) => group.length).sort((a, b) => a - b);

  if (groups.size === 1) {
    const count = sorted.length;
    const type = count === 1 ? "single" : count === 2 ? "pair" : count === 3 ? "triple" : "bomb";
    return { type, value: sorted[0].value, count, label: count >= 4 ? `${count}张炸弹` : { single: "单张", pair: "对子", triple: "三张" }[type] };
  }

  if (sorted.length === 5 && counts.join(",") === "2,3") {
    const tripleValue = [...groups.entries()].find(([, group]) => group.length === 3)[0];
    return { type: "triplePair", value: tripleValue, count: 5, label: "三带二" };
  }

  const isStraight =
    sorted.length >= 5 &&
    groups.size === sorted.length &&
    values.at(-1) <= 14 &&
    values.every((value, index) => index === 0 || value === values[index - 1] + 1);
  if (isStraight) {
    return { type: "straight", value: values.at(-1), count: sorted.length, label: `${sorted.length}张顺子` };
  }
  return null;
};

const canBeat = (play, previous) => {
  if (!previous) return true;
  if (play.type === "bomb" && previous.type !== "bomb") return true;
  if (play.type !== previous.type) return false;
  if (play.type === "bomb") {
    return play.count > previous.count || (play.count === previous.count && play.value > previous.value);
  }
  return play.count === previous.count && play.value > previous.value;
};

const startGame = () => {
  clearTimeout(aiTimer);
  const deck = createDeck();
  hands.value = [0, 1, 2, 3].map((player) =>
    sortCards(deck.filter((_, index) => index % 4 === player)),
  );
  selectedIds.value = [];
  turn.value = 0;
  currentPlay.value = null;
  passCount.value = 0;
  lastActions.value = ["", "", "", ""];
  winnerTeam.value = "";
  gameStatus.value = "playing";
  message.value = "轮到你出牌";
};

const toggleCard = (card) => {
  if (turn.value !== 0 || gameStatus.value !== "playing") return;
  const index = selectedIds.value.indexOf(card.id);
  if (index === -1) selectedIds.value.push(card.id);
  else selectedIds.value.splice(index, 1);
};

const finishGame = (playerIndex) => {
  winnerTeam.value = teamName(playerIndex);
  gameStatus.value = "finished";
  message.value = `${playerNames[playerIndex]}率先出完，${winnerTeam.value}获胜`;
  clearTimeout(aiTimer);
};

const advanceAfterPlay = (playerIndex, cards, play) => {
  currentPlay.value = { ...play, cards: sortCards(cards), player: playerIndex };
  passCount.value = 0;
  lastActions.value[playerIndex] = play.label;
  if (hands.value[playerIndex].length === 0) {
    finishGame(playerIndex);
    return;
  }
  turn.value = (playerIndex + 1) % 4;
  message.value = `轮到${playerNames[turn.value]}出牌`;
};

const playSelectedCards = () => {
  if (turn.value !== 0 || gameStatus.value !== "playing") return;
  const cards = hands.value[0].filter((card) => selectedIds.value.includes(card.id));
  const play = evaluateCards(cards);
  if (!play) {
    message.value = "所选牌无法组成有效牌型";
    return;
  }
  if (!canBeat(play, currentPlay.value)) {
    message.value = "所选牌无法压过当前牌型";
    return;
  }
  const selectedSet = new Set(selectedIds.value);
  hands.value[0] = hands.value[0].filter((card) => !selectedSet.has(card.id));
  selectedIds.value = [];
  advanceAfterPlay(0, cards, play);
};

const passTurn = (playerIndex = 0) => {
  if (turn.value !== playerIndex || !currentPlay.value || gameStatus.value !== "playing") return;
  selectedIds.value = [];
  lastActions.value[playerIndex] = "过牌";
  passCount.value += 1;

  if (passCount.value >= 3) {
    const leader = currentPlay.value.player;
    currentPlay.value = null;
    passCount.value = 0;
    turn.value = leader;
    message.value = `${playerNames[leader]}获得新一轮出牌权`;
  } else {
    turn.value = (playerIndex + 1) % 4;
    message.value = `${playerNames[playerIndex]}过牌，轮到${playerNames[turn.value]}`;
  }
};

const findStraight = (hand, length, minimumValue = 0) => {
  const groups = groupCards(hand);
  const values = [...groups.keys()].filter((value) => value <= 14).sort((a, b) => a - b);
  for (let start = 0; start <= values.length - length; start += 1) {
    const sequence = values.slice(start, start + length);
    const consecutive = sequence.every(
      (value, index) => index === 0 || value === sequence[index - 1] + 1,
    );
    if (consecutive && sequence.at(-1) > minimumValue) {
      return sequence.map((value) => groups.get(value)[0]);
    }
  }
  return null;
};

const findTriplePair = (hand, minimumValue = 0) => {
  const groups = groupCards(hand);
  const triples = [...groups.entries()].filter(([value, group]) => group.length >= 3 && value > minimumValue);
  const pairs = [...groups.entries()].filter(([, group]) => group.length >= 2);
  for (const [tripleValue, tripleCards] of triples) {
    const pair = pairs.find(([pairValue]) => pairValue !== tripleValue);
    if (pair) return [...tripleCards.slice(0, 3), ...pair[1].slice(0, 2)];
  }
  return null;
};

const findBomb = (hand, previous = null) => {
  const groups = [...groupCards(hand).entries()]
    .filter(([, group]) => group.length >= 4)
    .sort((a, b) => a[1].length - b[1].length || a[0] - b[0]);
  for (const [value, cards] of groups) {
    const play = evaluateCards(cards);
    if (!previous || canBeat(play, previous)) return cards;
  }
  return null;
};

const findAiPlay = (hand) => {
  const previous = currentPlay.value;
  const groups = [...groupCards(hand).entries()].sort((a, b) => a[0] - b[0]);

  if (!previous) {
    return (
      findStraight(hand, 5) ||
      findTriplePair(hand) ||
      groups.find(([, group]) => group.length === 3)?.[1] ||
      groups.find(([, group]) => group.length === 2)?.[1] ||
      [sortCards(hand)[0]]
    );
  }

  if (["single", "pair", "triple"].includes(previous.type)) {
    const needed = { single: 1, pair: 2, triple: 3 }[previous.type];
    const group = groups.find(([value, cards]) => value > previous.value && cards.length >= needed);
    if (group) return group[1].slice(0, needed);
  }
  if (previous.type === "straight") {
    const straight = findStraight(hand, previous.count, previous.value);
    if (straight) return straight;
  }
  if (previous.type === "triplePair") {
    const triplePair = findTriplePair(hand, previous.value);
    if (triplePair) return triplePair;
  }
  return findBomb(hand, previous);
};

const runAiTurn = (playerIndex) => {
  if (turn.value !== playerIndex || gameStatus.value !== "playing") return;
  const cards = findAiPlay(hands.value[playerIndex]);
  if (!cards) {
    passTurn(playerIndex);
    return;
  }
  const play = evaluateCards(cards);
  const ids = new Set(cards.map((card) => card.id));
  hands.value[playerIndex] = hands.value[playerIndex].filter((card) => !ids.has(card.id));
  advanceAfterPlay(playerIndex, cards, play);
};

watch(
  [turn, gameStatus],
  ([playerIndex, status]) => {
    clearTimeout(aiTimer);
    if (status === "playing" && playerIndex !== 0) {
      aiTimer = setTimeout(() => runAiTurn(playerIndex), 650);
    }
  },
  { flush: "post" },
);

onBeforeUnmount(() => clearTimeout(aiTimer));
</script>

<template>
  <main id="pages_danking">
    <section class="game_shell">
      <header class="top_bar">
        <div>
          <h1>掼蛋对局</h1>
          <p>简化规则 Demo</p>
        </div>
        <div class="teams">
          <span class="blue">你和搭档</span>
          <i>对阵</i>
          <span class="red">西家和东家</span>
        </div>
        <button type="button" @click="startGame">
          {{ gameStatus === "playing" ? "重新发牌" : "开始游戏" }}
        </button>
      </header>

      <div class="table">
        <div class="opponent top" :class="{ active: turn === 2 }">
          <div class="avatar blue">搭</div>
          <strong>搭档</strong>
          <span>{{ hands[2].length }} 张</span>
          <em>{{ lastActions[2] }}</em>
        </div>

        <div class="opponent left" :class="{ active: turn === 1 }">
          <div class="avatar red">西</div>
          <strong>西家</strong>
          <span>{{ hands[1].length }} 张</span>
          <em>{{ lastActions[1] }}</em>
        </div>

        <div class="opponent right" :class="{ active: turn === 3 }">
          <div class="avatar red">东</div>
          <strong>东家</strong>
          <span>{{ hands[3].length }} 张</span>
          <em>{{ lastActions[3] }}</em>
        </div>

        <div class="desk_center">
          <p class="turn_message">{{ message }}</p>
          <div v-if="currentPlay" class="last_play">
            <span class="play_owner">{{ playerNames[currentPlay.player] }} · {{ currentPlay.label }}</span>
            <div class="played_cards">
              <div
                v-for="card in currentPlay.cards"
                :key="card.id"
                class="card small"
                :class="{ red: card.red, joker: !card.suit }"
              >
                <strong>{{ card.rank }}</strong><i>{{ card.suit }}</i>
              </div>
            </div>
          </div>
          <div v-else class="last_play empty_play">等待本轮首家出牌</div>
        </div>

        <div class="player_area" :class="{ active: turn === 0 }">
          <div class="player_meta">
            <span class="avatar blue">我</span>
            <strong>你的手牌</strong>
            <em>{{ hands[0].length }} 张</em>
          </div>
          <div class="hand">
            <button
              v-for="(card, index) in hands[0]"
              :key="card.id"
              class="card"
              :class="{
                selected: selectedIds.includes(card.id),
                red: card.red,
                joker: !card.suit,
              }"
              :style="{ zIndex: index }"
              type="button"
              @click="toggleCard(card)"
            >
              <strong>{{ card.rank }}</strong>
              <i>{{ card.suit }}</i>
              <small>{{ card.suit || card.rank }}</small>
            </button>
          </div>
          <div class="actions">
            <button
              class="pass"
              type="button"
              :disabled="turn !== 0 || !currentPlay || gameStatus !== 'playing'"
              @click="passTurn()"
            >
              过牌
            </button>
            <button
              class="play"
              type="button"
              :disabled="turn !== 0 || selectedIds.length === 0 || gameStatus !== 'playing'"
              @click="playSelectedCards"
            >
              出牌
            </button>
          </div>
        </div>

        <div v-if="gameStatus !== 'playing'" class="overlay">
          <template v-if="gameStatus === 'ready'">
            <h2>双副牌四人对局</h2>
            <p>你与对面的搭档同队，任一队员率先出完手牌即可获胜</p>
            <button type="button" @click="startGame">开始发牌</button>
          </template>
          <template v-else>
            <h2>{{ winnerTeam }}获胜</h2>
            <p>{{ message }}</p>
            <button type="button" @click="startGame">再来一局</button>
          </template>
        </div>
      </div>

      <footer class="rule_tip">
        支持单张、对子、三张、三带二、五张及以上顺子、四张及以上炸弹。此版本采用先出完即胜的演示规则。
      </footer>
    </section>
  </main>
</template>

<style lang="less">
#pages_danking {
  &,
  * {
    box-sizing: border-box;
  }

  min-height: 100vh;
  padding: 20px;
  color: #e9f4ee;
  background: #12241d;

  button {
    font: inherit;
  }

  .game_shell {
    width: min(1180px, 100%);
    margin: 0 auto;
  }

  .top_bar {
    display: grid;
    align-items: center;
    margin-bottom: 14px;
    grid-template-columns: 1fr auto 1fr;
    gap: 18px;

    h1 {
      margin: 0;
      font-size: 24px;
    }

    p {
      margin: 4px 0 0;
      color: #90a79c;
      font-size: 12px;
    }

    .teams {
      display: flex;
      align-items: center;
      gap: 9px;
      font-size: 13px;

      span {
        padding: 6px 10px;
        border-radius: 7px;
      }

      .blue {
        color: #bfdbfe;
        background: rgb(37 99 235 / 25%);
      }

      .red {
        color: #fecaca;
        background: rgb(220 38 38 / 23%);
      }

      i {
        color: #6f887b;
        font-style: normal;
      }
    }

    > button {
      height: 36px;
      border: 1px solid rgb(255 255 255 / 15%);
      padding: 0 15px;
      border-radius: 8px;
      color: #e9f4ee;
      background: rgb(255 255 255 / 8%);
      cursor: pointer;
      justify-self: end;
    }
  }

  .table {
    position: relative;
    min-height: 690px;
    overflow: hidden;
    border: 7px solid #6e4930;
    border-radius: 44px;
    background:
      radial-gradient(circle at center, rgb(255 255 255 / 7%), transparent 45%),
      #176746;
    box-shadow:
      inset 0 0 70px rgb(0 0 0 / 25%),
      0 22px 55px rgb(0 0 0 / 28%);
  }

  .opponent {
    position: absolute;
    z-index: 3;
    display: grid;
    min-width: 92px;
    justify-items: center;
    color: #d8e9df;
    gap: 3px;

    &.top {
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
    }

    &.left {
      top: 39%;
      left: 22px;
      transform: translateY(-50%);
    }

    &.right {
      top: 39%;
      right: 22px;
      transform: translateY(-50%);
    }

    strong {
      font-size: 13px;
    }

    span,
    em {
      color: #a9c1b4;
      font-size: 11px;
      font-style: normal;
    }

    em {
      min-height: 18px;
      padding: 2px 6px;
      border-radius: 5px;
      color: #ffe4a8;
      background: rgb(0 0 0 / 16%);
    }

    &.active .avatar {
      box-shadow: 0 0 0 4px #facc15, 0 0 24px rgb(250 204 21 / 50%);
    }
  }

  .avatar {
    display: grid;
    width: 42px;
    height: 42px;
    border: 2px solid rgb(255 255 255 / 35%);
    border-radius: 50%;
    color: #fff;
    font-size: 15px;
    place-items: center;

    &.blue {
      background: #2563eb;
    }

    &.red {
      background: #dc2626;
    }
  }

  .desk_center {
    position: absolute;
    top: 40%;
    left: 50%;
    width: min(540px, 54%);
    min-height: 180px;
    transform: translate(-50%, -50%);
    text-align: center;

    .turn_message {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 16px;
      color: #d8e9df;
      background: rgb(0 0 0 / 18%);
      font-size: 12px;
    }

    .last_play {
      min-height: 130px;
      padding-top: 14px;
    }

    .empty_play {
      display: grid;
      color: rgb(220 238 228 / 45%);
      font-size: 13px;
      place-items: center;
    }

    .play_owner {
      display: block;
      margin-bottom: 12px;
      color: #d6e8dc;
      font-size: 12px;
    }

    .played_cards {
      display: flex;
      justify-content: center;
    }
  }

  .card {
    position: relative;
    width: 60px;
    height: 86px;
    flex: 0 0 auto;
    border: 1px solid #c8cdd3;
    border-radius: 7px;
    color: #172033;
    background: linear-gradient(145deg, #fff, #f4f5f6);
    box-shadow: 0 4px 9px rgb(0 0 0 / 18%);
    text-align: left;

    strong,
    i {
      position: absolute;
      left: 6px;
    }

    strong {
      top: 5px;
      font-size: 16px;
      line-height: 1;
    }

    i {
      top: 22px;
      font-size: 15px;
      font-style: normal;
    }

    small {
      position: absolute;
      right: 7px;
      bottom: 7px;
      font-size: 18px;
    }

    &.red {
      color: #dc2626;
    }

    &.joker strong {
      width: 16px;
      font-size: 11px;
      line-height: 1.1;
    }

    &.small {
      width: 48px;
      height: 68px;
      margin-left: -15px;

      &:first-child {
        margin-left: 0;
      }
    }
  }

  .player_area {
    position: absolute;
    z-index: 5;
    right: 18px;
    bottom: 16px;
    left: 18px;
    padding: 10px 12px 12px;
    border: 1px solid transparent;
    border-radius: 16px;
    background: rgb(0 0 0 / 12%);

    &.active {
      border-color: rgb(250 204 21 / 75%);
      box-shadow: 0 0 22px rgb(250 204 21 / 13%);
    }

    .player_meta {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;

      .avatar {
        width: 32px;
        height: 32px;
        font-size: 12px;
      }

      strong {
        font-size: 13px;
      }

      em {
        color: #a9c1b4;
        font-size: 11px;
        font-style: normal;
      }
    }

    .hand {
      display: flex;
      min-height: 105px;
      align-items: flex-end;
      overflow-x: auto;
      overflow-y: hidden;
      padding: 13px 12px 7px;

      .card {
        margin-left: -29px;
        cursor: pointer;
        transition: transform 0.14s ease;

        &:first-child {
          margin-left: 0;
        }

        &:hover,
        &.selected {
          transform: translateY(-13px);
        }

        &.selected {
          box-shadow: 0 0 0 3px #facc15, 0 7px 12px rgb(0 0 0 / 22%);
        }
      }
    }

    .actions {
      display: flex;
      justify-content: center;
      gap: 9px;
      margin-top: 7px;

      button {
        height: 34px;
        border: 0;
        padding: 0 20px;
        border-radius: 8px;
        color: #fff;
        cursor: pointer;

        &:disabled {
          cursor: not-allowed;
          filter: grayscale(0.8);
          opacity: 0.45;
        }
      }

      .pass {
        background: #64748b;
      }

      .play {
        background: #e43d32;
      }
    }
  }

  .overlay {
    position: absolute;
    z-index: 20;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    flex-direction: column;
    background: rgb(8 29 21 / 72%);
    text-align: center;
    backdrop-filter: blur(4px);

    h2 {
      margin: 0;
      font-size: clamp(27px, 5vw, 43px);
    }

    p {
      max-width: 520px;
      margin: 13px 0 22px;
      color: #c3d6ca;
      line-height: 1.7;
    }

    button {
      height: 42px;
      border: 0;
      padding: 0 22px;
      border-radius: 8px;
      color: #fff;
      background: #e43d32;
      box-shadow: 0 4px 0 #9f251e;
      cursor: pointer;
      font-weight: 700;
    }
  }

  .rule_tip {
    padding: 12px 4px 0;
    color: #82998e;
    font-size: 12px;
    line-height: 1.7;
    text-align: center;
  }
}

@media (max-width: 760px) {
  #pages_danking {
    padding: 10px;

    .top_bar {
      align-items: stretch;
      grid-template-columns: 1fr auto;

      .teams {
        display: none;
      }
    }

    .table {
      min-height: 650px;
      border-width: 4px;
      border-radius: 24px;
    }

    .opponent.left {
      left: 7px;
    }

    .opponent.right {
      right: 7px;
    }

    .desk_center {
      width: 62%;
    }

    .player_area {
      right: 6px;
      bottom: 7px;
      left: 6px;

      .hand .card {
        margin-left: -36px;
      }
    }
  }
}
</style>
