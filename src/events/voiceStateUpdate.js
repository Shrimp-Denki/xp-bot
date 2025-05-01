const { Events } = require('discord.js');
const voiceDB = require('../managers/voice');

// Map to track join timestamps: key = guildId-userId
const voiceTimers = new Map();

module.exports = {
  name: Events.VoiceStateUpdate,
  async execute(oldState, newState) {
    if (newState.member.user.bot) return;
    const guildId = newState.guild.id;
    const userId  = newState.member.id;
    const key     = `${guildId}-${userId}`;

    // Joined voice channel
    if (!oldState.channel && newState.channel) {
      voiceTimers.set(key, Date.now());
    }
    // Switched channel
    else if (oldState.channel && newState.channel && oldState.channel.id !== newState.channel.id) {
      const start = voiceTimers.get(key);
      if (start) {
        const diff = Math.floor((Date.now() - start) / 1000);
        voiceDB.addTime(userId, guildId, diff);
      }
      voiceTimers.set(key, Date.now());
    }
    // Left voice channel
    else if (oldState.channel && !newState.channel) {
      const start = voiceTimers.get(key);
      if (start) {
        const diff = Math.floor((Date.now() - start) / 1000);
        voiceDB.addTime(userId, guildId, diff);
        voiceTimers.delete(key);
      }
    }
  }
};
