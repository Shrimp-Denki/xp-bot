// src/events/interactionCreate.js
const { Events } = require('discord.js');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return;
    const cmd = interaction.client.commands.get(interaction.commandName);
    if (!cmd) return;
    try {
      await cmd.execute(interaction);
    } catch (err) {
      console.error('Command Error:', err);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: '❌ Có lỗi khi thực thi lệnh.', ephemeral: true });
      } else {
        await interaction.followUp({ content: '❌ Có lỗi khi thực thi lệnh.', ephemeral: true });
      }
    }
  }
};
