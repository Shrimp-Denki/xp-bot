// src/events/interactionCreate.js
const {
  Events,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType
} = require('discord.js');
const xpDB = require('../managers/xp');

// Map lưu thông tin ai đã nhận trả lời cho mỗi thread
// key = threadId, value = { replier: string, guildId: string }
const answeredMap = new Map();

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isButton()) return;

    const { customId, channel, client, user } = interaction;

    // --- Vote button in DM ---
    if (customId.startsWith('vote_')) {
      const [, replierId, starsStr] = customId.split('_');
      const stars   = Number(starsStr);
      const askerId = user.id;

      // Find matching thread entry
      let threadId, guildId;
      for (const [tid, info] of answeredMap.entries()) {
        if (info.replier === replierId) {
          threadId = tid;
          guildId  = info.guildId;
          break;
        }
      }
      if (!threadId || !guildId) {
        return interaction.reply({ content: '❌ Không tìm thấy phiên trả lời phù hợp.', ephemeral: true });
      }

      // Award XP
      xpDB.addXP(askerId, guildId, 20);
      const xpMap = { 2:10, 3:20, 4:30, 5:50 };
      const xpForReply = xpMap[stars] || 0;
      xpDB.addXP(replierId, guildId, xpForReply);

      // Reply to asker
      await interaction.reply({
        content: `✅ Cảm ơn bạn đã vote **${stars}** sao!\n• Bạn nhận **20 XP**\n• <@${replierId}> nhận **${xpForReply} XP**`,
        ephemeral: true
      });

      // DM to replier
      try {
        const replierUser = await client.users.fetch(replierId);
        await replierUser.send(
          `🎉 <@${askerId}> đã vote **${stars}** sao cho bạn và bạn nhận **${xpForReply} XP**!`
        );
      } catch {
        // ignore if DM fails
      }

      // Lock the thread so it's read-only for everyone
      try {
        const guild = client.guilds.cache.get(guildId);
        const threadChan =
          guild.threads.cache.get(threadId) ||
          await guild.threads.fetch(threadId);
        if (threadChan) {
          await threadChan.setLocked(true);
          const everyone = guild.roles.everyone;
          await threadChan.permissionOverwrites.edit(everyone, {
            ViewChannel: true,
            SendMessages: false,
            ReadMessageHistory: true
          });
          // Also remove send permission from asker & replier
          for (const id of [askerId, replierId]) {
            await threadChan.permissionOverwrites.edit(id, {
              ViewChannel: true,
              SendMessages: false,
              ReadMessageHistory: true
            });
          }
        }
      } catch (err) {
        console.error('Lỗi khi khóa thread sau vote:', err);
      }

      // Remove the entry
      answeredMap.delete(threadId);
      return;
    }

    // --- Only handle these two buttons in forum threads ---
    if (customId !== 'answer_question' && customId !== 'done_question') {
      return; // ignore other buttons (e.g. /leaderboard)
    }
    if (
      channel.type !== ChannelType.GuildPublicThread &&
      channel.type !== ChannelType.GuildPrivateThread
    ) {
      return; // must be in a thread
    }

    const thread   = channel;
    const threadId = thread.id;
    const askerId  = thread.ownerId;
    const userId   = user.id;

    // --- "Trả lời" button ---
    if (customId === 'answer_question') {
      if (userId === askerId) {
        return interaction.reply({ content: '❌ Bạn không thể tự trả lời bài của mình.', ephemeral: true });
      }
      if (answeredMap.has(threadId)) {
        return interaction.reply({ content: '❌ Đã có người nhận câu này rồi.', ephemeral: true });
      }
      answeredMap.set(threadId, { replier: userId, guildId: thread.guildId });
      return interaction.reply({
        content: '✅ Bạn đã nhận trả lời! Hãy soạn câu trả lời trong thread này.',
        ephemeral: true
      });
    }

    // --- "Xong" button ---
    if (customId === 'done_question') {
      if (userId === askerId) {
        return interaction.reply({ content: '❌ Bạn không thể tự kết thúc bài của mình.', ephemeral: true });
      }
      const info = answeredMap.get(threadId);
      if (!info || info.replier !== userId) {
        return interaction.reply({ content: '❌ Chỉ người nhận trả lời mới kết thúc bài này.', ephemeral: true });
      }

      // DM asker immediately to vote
      const threadName = thread.name;
      try {
        const askerUser = await client.users.fetch(askerId);
        const dm = await askerUser.createDM();
        const voteRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId(`vote_${userId}_1`).setLabel('⭐').setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId(`vote_${userId}_2`).setLabel('⭐⭐').setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId(`vote_${userId}_3`).setLabel('⭐⭐⭐').setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId(`vote_${userId}_4`).setLabel('⭐⭐⭐⭐').setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId(`vote_${userId}_5`).setLabel('⭐⭐⭐⭐⭐').setStyle(ButtonStyle.Primary)
        );
        await dm.send({
          content: `Thread **"${threadName}"** đã hoàn thành bởi <@${userId}>.\n` +
                   `Mời bạn vote 1–5 sao cho câu trả lời.`,
          components: [voteRow]
        });
      } catch {
        // ignore if DM fails
      }

      return interaction.reply({
        content: '📨 Đã gửi lời mời vote đến người hỏi!',
        ephemeral: true
      });
    }
  }
};
