// src/events/messageCreate.js
const { Events, EmbedBuilder } = require('discord.js');
const xpCfg     = require('../config/xp');
const xpDB      = require('../managers/xp');
const { calculateLevel } = require('../managers/level');

const cooldowns = new Map();       // key = `${guildId}-${userId}` → timestamp ms
const COOLDOWN = 10 * 1000;        // 10s

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.bot || !message.guild || !message.content) return;

    // 1) Cooldown chống spam
    const key  = `${message.guild.id}-${message.author.id}`;
    const last = cooldowns.get(key) || 0;
    if (Date.now() - last < COOLDOWN) return;
    cooldowns.set(key, Date.now());

    // 2) Tính old level
    const oldTotalXP = xpDB.getXP(message.author.id, message.guild.id);
    const { level: oldLevel } = calculateLevel(oldTotalXP);

    // 3) Tính XP dựa trên độ dài text
    const len = message.content.length;
    let xp = Math.min(Math.floor(len / 10), 30);  // 1 XP / 10 ký tự, max 30 XP

    // 4) Áp dụng channel multiplier (nếu có)
    xp *= (xpCfg.channelMultipliers[message.channel.id] || 1);

    // 5) Áp dụng role multiplier
    for (const [roleId, mul] of Object.entries(xpCfg.levelMultipliers)) {
      if (message.member.roles.cache.has(roleId)) {
        xp *= mul;
        break;
      }
    }
    xp = Math.round(xp);

    // 6) Cộng XP và tính new level
    xpDB.addXP(message.author.id, message.guild.id, xp);
    const newTotalXP = xpDB.getXP(message.author.id, message.guild.id);
    const { level: newLevel, xpIntoLevel, xpNeeded } = calculateLevel(newTotalXP);

    // 7) Ghi log (nếu có cấu hình logChannelId)
    const logCh = message.guild.channels.cache.get(xpCfg.logChannelId);
    if (logCh && logCh.isTextBased()) {
      const embed = new EmbedBuilder()
        .setTitle('🎖️ XP Update')
        .addFields(
          { name: 'User',    value: `<@${message.author.id}>`, inline: true },
          { name: 'XP thêm', value: `+${xp}`,                 inline: true },
          { name: 'Tổng XP', value: `**${newTotalXP}**`,     inline: true },
          { name: 'Level',   value: `${oldLevel} → ${newLevel}`, inline: true },
        )
        .setTimestamp();
      await logCh.send({ embeds: [embed] });
    }

    // 8) Nếu lên cấp thì gửi thông báo ngay trong kênh
    if (newLevel > oldLevel) {
      await message.reply(
        `🎉 Chúc mừng ${message.member}, bạn vừa lên **Level ${newLevel}**! ` +
        `(${xpIntoLevel}/${xpNeeded} XP trong cấp hiện tại)`
      );
    }
  }
};
