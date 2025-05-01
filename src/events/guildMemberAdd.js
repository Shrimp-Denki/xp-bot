const { Events } = require('discord.js');

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member) {
    const cached = member.client.invitesCache.get(member.guild.id);
    let newInvs;
    try {
      newInvs = await member.guild.invites.fetch();
      member.client.invitesCache.set(member.guild.id, newInvs);
    } catch {
      return;
    }
    const used = newInvs.find(i => {
      const prev = cached.get(i.code);
      return prev && i.uses > prev.uses;
    });
    if (used?.inviter) {
      member.client.invitedByMap.set(member.id, used.inviter.id);
    }
  }
};
