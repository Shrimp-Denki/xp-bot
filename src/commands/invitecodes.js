const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('invitecodes')
    .setDescription(`Danh sách mã mời của người dùng`)
    .addUserOption(o => o.setName('user').setDescription('Người dùng bạn muốn')),
  async execute(interaction) {
    const target = interaction.options.getUser('user') || interaction.user;
    const invites = await interaction.guild.invites.fetch();
    const own = invites.filter(inv => inv.inviter?.id === target.id);

    if (!own.size) {
      return interaction.reply(`${target} chưa tạo invite nào.`);
    }

    const list = own.map(inv => `\`${inv.code}\` → ${inv.uses} uses`).join('\n');
    await interaction.reply(`📜 Invite codes của ${target}:\n${list}`);
  }
};
