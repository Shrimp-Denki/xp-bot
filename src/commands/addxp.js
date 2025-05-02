// src/commands/addxp.js
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const xpDB = require('../managers/xp');
const { calculateLevel } = require('../managers/level');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addxp')
    .setDescription('Thêm hoặc trừ XP cho một user (bỏ qua multiplier và cap ngày).')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addUserOption(opt =>
      opt.setName('user')
         .setDescription('User cần chỉnh XP')
         .setRequired(true)
    )
    .addIntegerOption(opt =>
      opt.setName('amount')
         .setDescription('Số XP muốn thêm (hoặc nhập âm để trừ)')
         .setRequired(true)
    ),
  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');
    const guildId = interaction.guild.id;

    // Validation
    if (amount === 0) {
      return interaction.reply({ content: '❌ Bạn phải nhập số khác 0.', ephemeral: true });
    }
    if (Math.abs(amount) > 10000) {
      return interaction.reply({ content: '❌ Số XP quá lớn (tối đa 10000).', ephemeral: true });
    }

    // Thêm XP trực tiếp (không cập nhật xp hàng ngày)
    xpDB.addXP(target.id, guildId, amount);

    // Lấy tổng XP và level mới
    const totalXP = xpDB.getXP(target.id, guildId);
    const { level, xpIntoLevel, xpNeeded } = calculateLevel(totalXP);

    // Phản hồi
    await interaction.reply({
      content:
        `✅ Đã ${amount > 0 ? 'thêm' : 'trừ'} **${Math.abs(amount)} XP** cho ${target}.\n` +
        `• Tổng XP hiện tại: **${totalXP}**\n` +
        `• Level hiện tại: **${level}** (${xpIntoLevel}/${xpNeeded} XP trong level)`,
      ephemeral: true
    });
  },
};
