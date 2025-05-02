// src/events/inviteCreate.js
const { Events } = require('discord.js');

module.exports = {
  name: Events.InviteCreate,
  async execute(invite) {
    const guildInvites = invite.client.invites.get(invite.guild.id);
    if (guildInvites) {
      guildInvites.set(invite.code, invite);
    }
  }
};
