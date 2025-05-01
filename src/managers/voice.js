const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

// Ensure data directory exists
tmpDir = path.resolve(__dirname, '../data');
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

const db = new Database(path.join(tmpDir, 'xp.sqlite'));
// Add voice table if not exists
db.prepare(`
  CREATE TABLE IF NOT EXISTS voice (
    userId TEXT,
    guildId TEXT,
    totalSeconds INTEGER DEFAULT 0,
    PRIMARY KEY(userId, guildId)
  )
`).run();

module.exports = {
  addTime(userId, guildId, seconds) {
    db.prepare(
      `INSERT INTO voice(userId, guildId, totalSeconds) VALUES(?, ?, ?)
       ON CONFLICT(userId, guildId) DO UPDATE SET totalSeconds = totalSeconds + ?`
    ).run(userId, guildId, seconds, seconds);
  },

  getTopVoice(guildId, limit = 10) {
    return db.prepare(
      `SELECT userId, totalSeconds FROM voice WHERE guildId = ? ORDER BY totalSeconds DESC LIMIT ?`
    ).all(guildId, limit);
  },

  getUserVoice(userId, guildId) {
    const row = db.prepare(
      `SELECT totalSeconds FROM voice WHERE userId = ? AND guildId = ?`
    ).get(userId, guildId);
    return row ? row.totalSeconds : 0;
  }
};
