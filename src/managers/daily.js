const fs2 = require('fs');
const path2 = require('path');
const Database2 = require('better-sqlite3');

// Ensure data dir
const dataDir2 = path2.resolve(__dirname, '../data');
if (!fs2.existsSync(dataDir2)) fs2.mkdirSync(dataDir2, { recursive: true });

const db2 = new Database2(path2.join(dataDir2, 'xp.sqlite'));
// Create daily table
db2.prepare(`
  CREATE TABLE IF NOT EXISTS daily (
    userId TEXT,
    guildId TEXT,
    last INTEGER,
    streak INTEGER DEFAULT 0,
    PRIMARY KEY(userId, guildId)
  )
`).run();

module.exports = {
  canClaim(userId, guildId) {
    const row = db2.prepare(`SELECT last FROM daily WHERE userId=? AND guildId=?`).get(userId, guildId);
    if (!row) return true;
    const last = new Date(row.last);
    const now  = new Date();
    return now.toDateString() !== last.toDateString();
  },

  claim(userId, guildId) {
    const now = Date.now();
    const row = db2.prepare(`SELECT streak FROM daily WHERE userId=? AND guildId=?`).get(userId, guildId);
    const newStreak = row ? row.streak + 1 : 1;
    db2.prepare(
      `INSERT INTO daily(userId,guildId,last,streak) VALUES(?,?,?,?)
       ON CONFLICT(userId,guildId) DO UPDATE SET last=?, streak=?`
    ).run(userId, guildId, now, newStreak, now, newStreak);
    return newStreak;
  }
};

