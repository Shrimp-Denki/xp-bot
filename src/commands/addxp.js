const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const xpDB = require('../managers/xp');
const { calculateLevel } = require('../managers/level');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addxp')
    .setDescription('Thêm XP cho một user')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addUserOption(opt =>
      opt.setName('user')
         .setDescription('User cần thêm XP')
         .setRequired(true)
    )
    .addIntegerOption(opt =>
      opt.setName('amount')
         .setDescription('Số lượng XP muốn thêm (có thể âm)')
         .setRequired(true)
    ),
  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');

    xpDB.addXP(target.id, interaction.guild.id, amount);
    const totalXP = xpDB.getXP(target.id, interaction.guild.id);
    const { level, xpIntoLevel, xpNeeded } = calculateLevel(totalXP);

    await interaction.reply(
      `✅ Đã ${amount >= 0 ? 'thêm' : 'trừ'} **${Math.abs(amount)} XP** cho ${target}.\n` +
      `• Tổng XP: **${totalXP}**\n` +
      `• Level: **${level}** (${xpIntoLevel}/${xpNeeded})`
    );
  },
};
