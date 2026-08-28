export function identifyPattern(inputCards) {
  const cards = sortCards(inputCards);
  const entries = [...countRanks(cards).entries()].sort((a, b) => a[0] - b[0]);
  const counts = entries.map((entry) => entry[1]);
  const ranks = entries.map((entry) => entry[0]);
  const length = cards.length;

  if (length === 2 && ranks.includes(16) && ranks.includes(17)) return pattern("rocket", 17, 2);
  if (length === 4 && counts.length === 1 && counts[0] === 4) return pattern("bomb", ranks[0], 4);
  if (length === 1) return pattern("single", ranks[0], 1);
  if (length === 2 && counts.length === 1) return pattern("pair", ranks[0], 2);
  if (length === 3 && counts.length === 1) return pattern("triple", ranks[0], 3);
  if (length === 4 && counts.includes(3)) return pattern("triple_single", rankWithCount(entries, 3), 4);
  if (length === 5 && counts.includes(3) && counts.includes(2)) return pattern("triple_pair", rankWithCount(entries, 3), 5);
  if (length >= 5 && counts.every((count) => count === 1) && isSequence(ranks)) {
    return pattern("straight", ranks.at(-1), length);
  }
  if (length >= 6 && length % 2 === 0 && counts.every((count) => count === 2) && isSequence(ranks)) {
    return pattern("pair_straight", ranks.at(-1), length);
  }

  const airplane = identifyAirplane(entries, length);
  if (airplane) return airplane;
  if (length === 6 && counts.includes(4)) return pattern("four_two_single", rankWithCount(entries, 4), 6);
  if (
    length === 8 &&
    counts.filter((count) => count === 4).length === 1 &&
    counts.filter((count) => count === 2).length === 2
  ) {
    return pattern("four_two_pair", rankWithCount(entries, 4), 8);
  }
  return null;
}

export function beats(next, previous) {
  if (next.type === "rocket") return previous.type !== "rocket";
  if (previous.type === "rocket") return false;
  if (next.type === "bomb" && previous.type !== "bomb") return true;
  if (next.type !== previous.type || next.length !== previous.length) return false;
  return next.main > previous.main;
}

export function createDeck() {
  const cards = [];
  for (let rank = 3; rank <= 15; rank += 1) {
    ["a", "b", "c", "d"].forEach((suit) => cards.push({ id: `${suit}-${rank}`, suit, rank }));
  }
  cards.push({ id: "joker-small", suit: "joker", rank: 16 });
  cards.push({ id: "joker-big", suit: "joker", rank: 17 });
  return cards;
}

export function patternLabel(type) {
  return ({
    single: "单牌", pair: "对子", triple: "三张", triple_single: "三带一",
    triple_pair: "三带二", straight: "顺子", pair_straight: "连对", airplane: "飞机",
    airplane_single: "飞机带单", airplane_pair: "飞机带对", four_two_single: "四带二",
    four_two_pair: "四带两对", bomb: "炸弹", rocket: "王炸",
  })[type] || "牌组";
}

export function sortCards(cards) {
  const suitOrder = { a: 0, b: 1, c: 2, d: 3, joker: 4 };
  return [...cards].sort((a, b) => a.rank - b.rank || suitOrder[a.suit] - suitOrder[b.suit]);
}

export function shuffle(cards) {
  const result = [...cards];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

function identifyAirplane(entries, length) {
  for (const wingSize of [0, 1, 2]) {
    const unit = 3 + wingSize;
    if (length % unit !== 0) continue;
    const tripletCount = length / unit;
    if (tripletCount < 2) continue;
    const candidates = entries.filter(([rank, count]) => rank <= 14 && count >= 3).map(([rank]) => rank);

    for (let index = 0; index <= candidates.length - tripletCount; index += 1) {
      const sequence = candidates.slice(index, index + tripletCount);
      if (!isSequence(sequence)) continue;
      const tripletRanks = new Set(sequence);
      const rest = entries.flatMap(([rank, count]) =>
        Array(tripletRanks.has(rank) ? count - 3 : count).fill(rank),
      );
      if (rest.length !== tripletCount * wingSize) continue;
      if (wingSize === 2) {
        const restCounts = countRanks(rest.map((rank) => ({ rank })));
        if (restCounts.size !== tripletCount || [...restCounts.values()].some((count) => count !== 2)) continue;
      }
      const type = wingSize === 0 ? "airplane" : wingSize === 1 ? "airplane_single" : "airplane_pair";
      return pattern(type, sequence.at(-1), length);
    }
  }
  return null;
}

function countRanks(cards) {
  const groups = new Map();
  cards.forEach((card) => groups.set(card.rank, (groups.get(card.rank) || 0) + 1));
  return groups;
}

function rankWithCount(entries, count) {
  return entries.find((entry) => entry[1] === count)?.[0];
}

function isSequence(ranks) {
  return ranks.length > 0 && ranks.at(-1) <= 14 && ranks.every((rank, index) => index === 0 || rank === ranks[index - 1] + 1);
}

function pattern(type, main, length) {
  return { type, main, length };
}
