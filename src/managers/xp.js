// src/managers/xp.js
const fs   = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

// Đảm bảo thư mục data tồn tại
const dataDir = path.resolve(__dirname, '../data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, 'xp.sqlite');
const db = new Database(dbPath);

// Tạo bảng xp
db.prepare(`
  CREATE TABLE IF NOT EXISTS xp (
    userId TEXT,
    guildId TEXT,
    xp INTEGER DEFAULT 0,
    month INTEGER,
    PRIMARY KEY(userId, guildId)
  )
`).run();

// Tạo bảng daily cap
db.prepare(`
  CREATE TABLE IF NOT EXISTS daily_xp (
    userId TEXT,
    guildId TEXT,
    date TEXT,
    xp INTEGER DEFAULT 0,
    PRIMARY KEY(userId, guildId, date)
  )
`).run();

module.exports = {
  getXP(userId, guildId) {
    const row = db.prepare(
      `SELECT xp FROM xp WHERE userId=? AND guildId=?`
    ).get(userId, guildId);
    return row ? row.xp : 0;
  },

  addXP(userId, guildId, amount) {
    const m = new Date().getMonth();
    db.prepare(`
      INSERT INTO xp (userId, guildId, xp, month)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(userId, guildId) DO UPDATE SET
        xp = xp + ?,
        month = CASE WHEN month=? THEN month ELSE ? END
    `).run(userId, guildId, amount, m, amount, m, m);
  },

  getMonthlyXP(userId, guildId) {
    const row = db.prepare(`
      SELECT xp, month FROM xp WHERE userId=? AND guildId=?
    `).get(userId, guildId);
    if (!row) return 0;
    return row.month === new Date().getMonth() ? row.xp : 0;
  },

  getTodayXP(userId, guildId) {
    const today = new Date().toISOString().slice(0,10);
    const row = db.prepare(
      `SELECT xp FROM daily_xp WHERE userId=? AND guildId=? AND date=?`
    ).get(userId, guildId, today);
    return row ? row.xp : 0;
  },

  addTodayXP(userId, guildId, amount) {
    const today = new Date().toISOString().slice(0,10);
    db.prepare(`
      INSERT INTO daily_xp(userId, guildId, date, xp)
      VALUES(?,?,?,?)
      ON CONFLICT(userId, guildId, date) DO UPDATE SET
        xp = xp + ?
    `).run(userId, guildId, today, amount, amount);
  },

  topXP(guildId, limit = 10) {
    return db.prepare(`
      SELECT userId, xp FROM xp
      WHERE guildId=?
      ORDER BY xp DESC
      LIMIT ?
    `).all(guildId, limit);
  },

  // PHƯƠNG THỨC MỚI: trả về tất cả XP để tính level-leaderboard
  allXP(guildId) {
    return db.prepare(`
      SELECT userId, xp FROM xp
      WHERE guildId=?
    `).all(guildId);
  },

  resetMonth() {
    const m = new Date().getMonth();
    db.prepare(`UPDATE xp SET xp=0, month=?`).run(m);
  }
};
