const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('inviter')
    .setDescription('Tìm người đã mời người dùng')
    .addUserOption(o => o.setName('user').setDescription('Người dùng bạn muốn')),
  async execute(interaction) {
    const target    = interaction.options.getUser('user') || interaction.user;
    const inviterId = interaction.client.invitedByMap.get(target.id);

    if (!inviterId) {
      return interaction.reply(`Không tìm thấy inviter của ${target}.`);
    }
    await interaction.reply(`👉 ${target} được mời bởi <@${inviterId}>`);
  }
};
