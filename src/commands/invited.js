const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('invited')
    .setDescription('Find the list of users invited by the target user')
    .addUserOption(o => o.setName('user').setDescription('Target user')),
  async execute(interaction) {
    const target = interaction.options.getUser('user') || interaction.user;
    const mapInv = interaction.client.invitedByMap;
    const invited = [...mapInv.entries()]
      .filter(([,inv]) => inv === target.id)
      .map(([uid]) => `<@${uid}>`);

    if (!invited.length) {
      return interaction.reply(`${target} chưa mời ai.`);
    }
    await interaction.reply(`👥 ${target} đã mời:\n${invited.join('\n')}`);
  }
};
