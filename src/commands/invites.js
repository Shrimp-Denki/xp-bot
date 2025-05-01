const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('invites')
    .setDescription('Get the invite count of a user')
    .addUserOption(o => o.setName('user').setDescription('Target user')),
  async execute(interaction) {
    const target = interaction.options.getUser('user') || interaction.user;
    const invites = await interaction.guild.invites.fetch();
    const own = invites.filter(inv => inv.inviter?.id === target.id);
    const total = own.reduce((sum, inv) => sum + inv.uses, 0);

    await interaction.reply(`📨 ${target} đã mời tổng cộng **${total}** người.`);
  },
};
