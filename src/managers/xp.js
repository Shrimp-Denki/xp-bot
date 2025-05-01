// src/managers/xp.js
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

// Đảm bảo thư mục ./data tồn tại
const dataDir = path.resolve(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Đường dẫn đến file DB
const dbPath = path.join(dataDir, 'xp.sqlite');
const db = new Database(dbPath);

// Khởi tạo bảng nếu chưa có
db.prepare(`
  CREATE TABLE IF NOT EXISTS xp (
    userId TEXT,
    guildId TEXT,
    xp INTEGER DEFAULT 0,
    month INTEGER,
    PRIMARY KEY(userId, guildId)
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

  resetMonth() {
    const m = new Date().getMonth();
    db.prepare(`UPDATE xp SET xp=0, month=?`).run(m);
  },

  topXP(guildId, limit = 10) {
    return db.prepare(`
      SELECT userId, xp FROM xp
      WHERE guildId=?
      ORDER BY xp DESC
      LIMIT ?
    `).all(guildId, limit);
  },

  getMonthlyXP(userId, guildId) {
    const row = db.prepare(`
      SELECT xp, month FROM xp
      WHERE userId=? AND guildId=?
    `).get(userId, guildId);
    if (!row) return 0;
    return (row.month === new Date().getMonth()) ? row.xp : 0;
  },

  allXP(guildId) {
    return db.prepare(`
      SELECT userId, xp FROM xp
      WHERE guildId=?
    `).all(guildId);
  }
};
