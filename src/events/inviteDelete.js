// src/events/inviteDelete.js
const { Events } = require('discord.js');

module.exports = {
  name: Events.InviteDelete,
  async execute(invite) {
    const guildInvites = invite.client.invites.get(invite.guild.id);
    if (guildInvites) {
      guildInvites.delete(invite.code);
    }
  }
};
