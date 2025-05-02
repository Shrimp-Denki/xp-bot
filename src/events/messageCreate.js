// src/events/messageCreate.js
const { Events, EmbedBuilder } = require('discord.js');
const xpCfg     = require('../config/xp');
const xpDB      = require('../managers/xp');
const { calculateLevel } = require('../managers/level');

// Mapping level → role ID và tên (plain text)
const levelRoles = {
  5:   { id: '1367170246359777431',  name: '📝 Học sinh mới 2' },
  15:  { id: '1364467920511701045',  name: '📘 Chăm chỉ' },
  30:  { id: '1364467921933307915',  name: '📚 Cày đề thủ' },
  50:  { id: '1364467923422412911',  name: '🧠 Giỏi lý thuyết' },
  100: { id: '1364467925494403143',  name: '🎯 Thợ săn điểm cao' },
  150: { id: '1364467927222325308',  name: '🌟 Sao sáng lớp học' },
  200: { id: '1364467928887722085',  name: '🏅 Top học tập' },
  250: { id: '1364467930758385714',  name: '👑 Idol lớp mình' },
  300: { id: '1364467932544897056',  name: '🎓 Huyền thoại Topuni' }
};

const cooldowns = new Map();
const COOLDOWN = 10 * 1000; // 10 giây

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.bot || !message.guild || !message.content) return;

    // 1) Cooldown chống spam
    const key  = `${message.guild.id}-${message.author.id}`;
    const last = cooldowns.get(key) || 0;
    if (Date.now() - last < COOLDOWN) return;
    cooldowns.set(key, Date.now());

    // 2) Tính XP cơ bản: 1 XP / 2 ký tự, max 50 XP
    const len = message.content.length;
    let xpEarn = Math.min(Math.floor(len / 2), 50);

    // 3) Cap 800 XP/ngày
    const todayXP = xpDB.getTodayXP(message.author.id, message.guild.id);
    if (todayXP >= 800) return;
    if (todayXP + xpEarn > 800) xpEarn = 800 - todayXP;

    // 4) Áp multiplier theo channel
    xpEarn *= (xpCfg.channelMultipliers?.[message.channel.id] || 1);

    // 5) Áp multiplier theo highest-role
    for (const [roleId, mul] of Object.entries(xpCfg.levelMultipliers || {})) {
      if (message.member.roles.cache.has(roleId)) {
        xpEarn *= mul;
        break;
      }
    }
    xpEarn = Math.round(xpEarn);

    // 6) Cộng XP vào tổng và hôm nay
    xpDB.addXP(message.author.id, message.guild.id, xpEarn);
    xpDB.addTodayXP(message.author.id, message.guild.id, xpEarn);

    // 7) Tính level cũ & mới
    const newTotalXP = xpDB.getXP(message.author.id, message.guild.id);
    const { level: newLevel, xpIntoLevel, xpNeeded } = calculateLevel(newTotalXP);
    const oldTotalXP = newTotalXP - xpEarn;
    const { level: oldLevel } = calculateLevel(oldTotalXP);

    // 8) Gửi log XP vào kênh log nếu có cấu hình
    if (xpCfg.logChannelId) {
      const logCh = message.guild.channels.cache.get(xpCfg.logChannelId);
      if (logCh?.isTextBased()) {
        const embed = new EmbedBuilder()
          .setTitle('🎖️ XP Update')
          .addFields(
            { name: 'User',    value: `<@${message.author.id}>`, inline: true },
            { name: 'XP thêm', value: `+${xpEarn}`,               inline: true },
            { name: 'Tổng XP', value: `**${newTotalXP}**`,        inline: true },
            { name: 'Level',   value: `${oldLevel} → ${newLevel}`, inline: true }
          )
          .setTimestamp();
        await logCh.send({ embeds: [embed] }).catch(() => {});
      }
    }

    // 9) Nếu lên cấp
    if (newLevel > oldLevel) {
      const info = levelRoles[newLevel];
      let gaveRole = false;

      // Thử gán role tự động
      if (info) {
        const role = message.guild.roles.cache.get(info.id);
        if (role) {
          try {
            await message.member.roles.add(role);
            gaveRole = true;
          } catch {
            gaveRole = false;
          }
        }
      }

      // 10) Nếu bot không gán được role, gợi ý dùng /claim
      if (info && !gaveRole) {
        await message.reply(
          `🎁 Bạn đã đạt Level **${newLevel}** nhưng chưa có role **${info.name}**.\n` +
          `Hãy dùng lệnh \`/claim\` để nhận role này!`
        );
      }
    }
  }
};
