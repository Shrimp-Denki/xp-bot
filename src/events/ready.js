// src/events/ready.js
const { Events, Collection } = require('discord.js');

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    // 1) Cache all invites for invite-tracking elsewhere
    client.invites = new Collection();
    for (const [guildId, guild] of client.guilds.cache) {
      try {
        const invites = await guild.invites.fetch();
        client.invites.set(guildId, invites);
      } catch (err) {
        console.error(`❌ Không thể fetch invites cho guild ${guildId}:`, err);
      }
    }
    console.log(`✅ Cached invites cho ${client.invites.size} guild.`);
    console.log(`Ready! Logged in as ${client.user.tag}`);

    // 2) Set bot presence
    client.user.setPresence({
      activities: [{ name: 'với Hocmai.vn', type: 2 }],
      status: 'online',
    });

    // 3) IDs của server và các kênh voice cần đổi tên
    const GUILD_ID           = process.env.GUILD_ID;
    const MEMBER_CH_ID       = '1367782979782312056';  // Thành viên (cập nhật 30p/lần)
    const ONLINE_CH_ID       = '1367780951865950238';  // Đang online + DND (cập nhật 1p/lần)
    const VOICE_CH_ID        = '1367780980999327816';  // Đang học (voice) (cập nhật 1p/lần)
    const COUNTDOWN_CH_ID    = '1367779967332777994';  // THPT 2025 countdown (cập nhật 1h/lần)

    // 4) Helper: fetch guild & ensure members cached
    async function fetchGuild() {
      const guild = client.guilds.cache.get(GUILD_ID);
      if (!guild) {
        console.warn('❌ Không tìm thấy guild để cập nhật stats.');
        return null;
      }
      await guild.members.fetch();
      return guild;
    }

    // 5) Cập nhật member count (loại bot) mỗi 30 phút
    async function updateMemberCount() {
      const guild = await fetchGuild();
      if (!guild) return;
      const nonBotCount = guild.members.cache.filter(m => !m.user.bot).size;
      const ch = guild.channels.cache.get(MEMBER_CH_ID);
      if (ch?.isVoiceBased()) {
        ch.setName(`Thành viên: ${nonBotCount}`).catch(console.error);
      }
    }
    await updateMemberCount();
    setInterval(updateMemberCount, 30 * 60 * 1000);

    // 6) Cập nhật online + dnd và voice count mỗi phút
    async function updateOnlineVoice() {
      const guild = await fetchGuild();
      if (!guild) return;
      const nonBot = guild.members.cache.filter(m => !m.user.bot);

      const onlineCount = nonBot.filter(m =>
        m.presence?.status === 'online' ||
        m.presence?.status === 'dnd'
      ).size;
      const voiceCount  = nonBot.filter(m => !!m.voice.channel).size;

      const chOnline = guild.channels.cache.get(ONLINE_CH_ID);
      if (chOnline?.isVoiceBased()) {
        chOnline.setName(`Đang online: ${onlineCount}`).catch(console.error);
      }
      const chVoice = guild.channels.cache.get(VOICE_CH_ID);
      if (chVoice?.isVoiceBased()) {
        chVoice.setName(`Đang học: ${voiceCount}`).catch(console.error);
      }
    }
    await updateOnlineVoice();
    setInterval(updateOnlineVoice, 60 * 1000);

    // 7) Cập nhật countdown đến 25/6/2025 mỗi giờ
    async function updateCountdown() {
      const guild = client.guilds.cache.get(GUILD_ID);
      if (!guild) return;
      const ch = guild.channels.cache.get(COUNTDOWN_CH_ID);
      if (!ch?.isVoiceBased()) return;

      const now    = new Date();
      const target = new Date('2025-06-25T00:00:00+07:00');
      const diffMs = target - now;
      const days   = diffMs > 0 ? Math.ceil(diffMs / (1000 * 60 * 60 * 24)) : 0;

      ch.setName(`THPT 2025: ${days} ngày`).catch(console.error);
    }
    await updateCountdown();
    setInterval(updateCountdown, 60 * 60 * 1000);
  }
};
