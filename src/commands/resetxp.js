const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const xpDB = require('../managers/xp');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resetxp')
    .setDescription('🔄 Reset XP tháng cho toàn server')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction) {
    xpDB.resetMonth();
    await interaction.reply('✅ Đã reset XP tháng!');
  }
};
