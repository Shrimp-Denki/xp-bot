// src/commands/claim.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const xpDB = require('../managers/xp');
const { calculateLevel } = require('../managers/level');

// Bảng mapping Level → role ID
const levelRoles = {
  5:   '1367170246359777431',  // 📝 Học sinh mới 2
  15:  '1364467920511701045',  // 📘 Chăm chỉ
  30:  '1364467921933307915',  // 📚 Cày đề thủ
  50:  '1364467923422412911',  // 🧠 Giỏi lý thuyết
  100: '1364467925494403143',  // 🎯 Thợ săn điểm cao
  150: '1364467927222325308',  // 🌟 Sao sáng lớp học
  200: '1364467928887722085',  // 🏅 Top học tập
  250: '1364467930758385714',  // 👑 Idol lớp mình
  300: '1364467932544897056'   // 🎓 Huyền thoại Topuni
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('claim')
    .setDescription('Nhận các role theo cấp bạn đã đạt nhưng chưa có.'),
  async execute(interaction) {
    const userId = interaction.user.id;
    const guildId = interaction.guild.id;
    const member = interaction.member;

    // Tính Level hiện tại
    const totalXP = xpDB.getXP(userId, guildId);
    const { level: userLevel } = calculateLevel(totalXP);

    // Duyệt qua các mốc level, gán role nếu cần
    const toClaim = Object.entries(levelRoles)
      .map(([lvl, roleId]) => ({ lvl: Number(lvl), roleId }))
      .filter(({ lvl, roleId }) =>
        userLevel >= lvl && !member.roles.cache.has(roleId)
      )
      .sort((a, b) => a.lvl - b.lvl); // sort theo level tăng dần

    if (!toClaim.length) {
      return interaction.reply('🎁 Bạn đã sở hữu tất cả các role phù hợp với cấp hiện tại!');
    }

    // Gán tất cả role trong danh sách
    const added = [];
    for (const { roleId } of toClaim) {
      const role = interaction.guild.roles.cache.get(roleId);
      if (role) {
        try {
          await member.roles.add(role);
          added.push(`<@&${roleId}>`);
        } catch {}
      }
    }

    // Trả về thông báo
    const embed = new EmbedBuilder()
      .setTitle('✅ Claim Roles')
      .setDescription(
        added.length
          ? `Bạn đã nhận các role sau:\n${added.join('\n')}`
          : 'Không thể gán role (kiểm tra quyền của bot).'
      )
      .setColor('Green');

    await interaction.reply({ embeds: [embed] });
  }
};
