import config from "./config.js";

const { db } = config;
const PLAYER_PREFIX = "player:";
let tableReadyPromise;

export function ensureGameTable() {
  if (!tableReadyPromise) {
    tableReadyPromise = db.promise().query(`
      CREATE TABLE IF NOT EXISTS test (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        record_key VARCHAR(160) NOT NULL,
        record_type VARCHAR(16) NOT NULL,
        player_key VARCHAR(64) DEFAULT NULL,
        nickname VARCHAR(24) DEFAULT NULL,
        wallet_coins INT UNSIGNED NOT NULL DEFAULT 0,
        table_coins INT UNSIGNED NOT NULL DEFAULT 0,
        amount_cents INT UNSIGNED NOT NULL DEFAULT 0,
        trade_no VARCHAR(64) DEFAULT NULL,
        status VARCHAR(24) NOT NULL DEFAULT 'ACTIVE',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uk_test_record_key (record_key),
        UNIQUE KEY uk_test_trade_no (trade_no),
        KEY idx_test_player_key (player_key),
        KEY idx_test_record_type (record_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `).catch((error) => {
      tableReadyPromise = undefined;
      throw error;
    });
  }

  return tableReadyPromise;
}

export async function getOrCreatePlayer(playerKey, nickname) {
  await ensureGameTable();
  const safeNickname = normalizeNickname(nickname);
  await db.promise().execute(
    `INSERT INTO test
      (record_key, record_type, player_key, nickname, wallet_coins, table_coins)
     VALUES (?, 'PLAYER', ?, ?, 0, 1000)
     ON DUPLICATE KEY UPDATE nickname = VALUES(nickname)`,
    [playerRecordKey(playerKey), playerKey, safeNickname],
  );
  return getPlayer(playerKey);
}

export async function getPlayer(playerKey) {
  await ensureGameTable();
  const [rows] = await db.promise().execute(
    `SELECT player_key AS playerKey, nickname,
            wallet_coins AS walletCoins, table_coins AS tableCoins
       FROM test
      WHERE record_key = ? AND record_type = 'PLAYER'
      LIMIT 1`,
    [playerRecordKey(playerKey)],
  );
  return rows[0] || null;
}

export async function transferCoins(playerKey, direction, amount) {
  await ensureGameTable();
  const coins = Number(amount);
  if (!Number.isSafeInteger(coins) || coins < 1 || coins > 1_000_000) {
    throw new Error("金币数量无效");
  }

  const isUp = direction === "up";
  const source = isUp ? "wallet_coins" : "table_coins";
  const target = isUp ? "table_coins" : "wallet_coins";
  const [result] = await db.promise().execute(
    `UPDATE test
        SET ${source} = ${source} - ?, ${target} = ${target} + ?
      WHERE record_key = ? AND record_type = 'PLAYER' AND ${source} >= ?`,
    [coins, coins, playerRecordKey(playerKey), coins],
  );
  if (result.affectedRows !== 1) throw new Error("可用金币不足");
  return getPlayer(playerKey);
}

export async function settleGame(changes) {
  await ensureGameTable();
  const connection = await db.promise().getConnection();
  try {
    await connection.beginTransaction();
    for (const change of changes) {
      const delta = Number(change.delta);
      if (!Number.isSafeInteger(delta) || Math.abs(delta) > 1_000_000) {
        throw new Error("结算金额无效");
      }
      const [result] = await connection.execute(
        `UPDATE test
            SET table_coins = table_coins + ?
          WHERE record_key = ? AND record_type = 'PLAYER'
            AND table_coins + ? >= 0`,
        [delta, playerRecordKey(change.playerKey), delta],
      );
      if (result.affectedRows !== 1) throw new Error("玩家金币不足，无法结算");
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function createPendingRecharge(playerKey, nickname, tradeNo, amountCents) {
  await ensureGameTable();
  if (amountCents !== 1) throw new Error("斗地主充值金额只能为 0.01 元");
  await db.promise().execute(
    `INSERT INTO test
      (record_key, record_type, player_key, nickname, amount_cents, trade_no, status)
     VALUES (?, 'PAYMENT', ?, ?, ?, ?, 'PENDING')`,
    [`payment:${tradeNo}`, playerKey, normalizeNickname(nickname), amountCents, tradeNo],
  );
}

export async function creditRecharge(playerKey, nickname, tradeNo, amountCents) {
  await ensureGameTable();
  if (amountCents !== 1) throw new Error("斗地主充值金额只能为 0.01 元");

  const connection = await db.promise().getConnection();
  try {
    await connection.beginTransaction();
    const [payment] = await connection.execute(
      `UPDATE test
          SET status = 'PAID'
        WHERE record_key = ? AND record_type = 'PAYMENT' AND player_key = ?
          AND amount_cents = ? AND status = 'PENDING'`,
      [`payment:${tradeNo}`, playerKey, amountCents],
    );
    if (payment.affectedRows !== 1) {
      const [rows] = await connection.execute(
        `SELECT status FROM test
          WHERE record_key = ? AND record_type = 'PAYMENT' AND player_key = ? LIMIT 1`,
        [`payment:${tradeNo}`, playerKey],
      );
      await connection.rollback();
      if (rows[0]?.status === "PAID") return { credited: false, player: await getPlayer(playerKey) };
      throw new Error("充值订单与玩家不匹配");
    }
    await connection.execute(
      `INSERT INTO test
        (record_key, record_type, player_key, nickname, wallet_coins, table_coins)
       VALUES (?, 'PLAYER', ?, ?, 1000, 0)
       ON DUPLICATE KEY UPDATE wallet_coins = wallet_coins + 1000`,
      [playerRecordKey(playerKey), playerKey, normalizeNickname(nickname)],
    );
    await connection.commit();
    return { credited: true, player: await getPlayer(playerKey) };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

function playerRecordKey(playerKey) {
  return `${PLAYER_PREFIX}${playerKey}`;
}

function normalizeNickname(value) {
  const nickname = typeof value === "string" ? value.trim().slice(0, 24) : "";
  return nickname || "牌友";
}
