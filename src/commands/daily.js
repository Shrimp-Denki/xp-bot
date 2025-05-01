const { SlashCommandBuilder } = require('discord.js');
const dailyDB = require('../managers/daily');
const xpDB    = require('../managers/xp');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('🎁 Claim your daily XP reward'),
  async execute(interaction) {
    const userId  = interaction.user.id;
    const guildId = interaction.guild.id;
    if (!dailyDB.canClaim(userId, guildId)) {
      return interaction.reply('Bạn đã claim daily rồi, hãy quay lại sau.');
    }
    const streak = dailyDB.claim(userId, guildId);
    const reward = 100 * streak; // Ví dụ: 100 XP cơ bản
    xpDB.addXP(userId, guildId, reward);
    await interaction.reply(
      `🎉 Bạn đã nhận **${reward} XP** cho ngày thứ **${streak}** liên tiếp!`
    );
  }
};
