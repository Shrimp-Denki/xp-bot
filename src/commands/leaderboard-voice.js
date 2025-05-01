const { SlashCommandBuilder } = require('discord.js');
const voiceDB = require('../managers/voice');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard-voice')
    .setDescription('📊 Top voice chat leaderboard'),
  async execute(interaction) {
    const top = voiceDB.getTopVoice(interaction.guild.id, 10);
    const desc = top.length
      ? top.map((r, i) => `${i+1}. <@${r.userId}> — ${Math.floor(r.totalSeconds/60)} phút`).join('\n')
      : 'Chưa có dữ liệu.';
    await interaction.reply(`🎙️ **Top Voice Chat** 🎙️\n${desc}`);
  }
};
