// src/commands/leaderboard.js
const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    ComponentType
  } = require('discord.js');
  
  module.exports = {
    data: new SlashCommandBuilder()
      .setName('leaderboard')
      .setDescription('Chọn loại leaderboard: Invite, Level hoặc XP'),
    async execute(interaction) {
      // 1) Acknowledge interaction
      await interaction.deferReply();
  
      // 2) Chuẩn bị 3 nút
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('lb_invite').setLabel('Invite').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('lb_level' ).setLabel('Level' ).setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('lb_xp'    ).setLabel('XP'    ).setStyle(ButtonStyle.Secondary)
      );
  
      // 3) Embed intro
      const intro = new EmbedBuilder()
        .setTitle('🏆 Chọn leaderboard')
        .setDescription('Nhấn nút Invite, Level hoặc XP để xem Top.')
        .setColor('Blue');
  
      // 4) Edit deferred reply để show embed + buttons
      await interaction.editReply({ embeds: [intro], components: [row] });
  
      // 5) Lấy message gốc để tạo collector
      const msg = await interaction.fetchReply();
  
      const collector = msg.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 60_000,
        filter: btn => btn.user.id === interaction.user.id
      });
  
      collector.on('collect', async btn => {
        let embed;
        const xpDB = require('../managers/xp');
        const { calculateLevel } = require('../managers/level');
        const guildId = interaction.guild.id;
  
        if (btn.customId === 'lb_invite') {
          // Top Invite
          const counts = {};
          for (const inv of interaction.client.invitedByMap.values()) {
            counts[inv] = (counts[inv] || 0) + 1;
          }
          const sorted = Object.entries(counts)
            .sort((a,b)=>b[1]-a[1]).slice(0,10);
          const desc = sorted.length
            ? sorted.map(([id,c],i)=>`${i+1}. <@${id}> — ${c}`).join('\n')
            : 'Chưa có dữ liệu.';
          embed = new EmbedBuilder()
            .setTitle('📨 Top Invite')
            .setDescription(desc)
            .setColor('Green');
  
        } else if (btn.customId === 'lb_level') {
          // Top Level
          const rows = xpDB.allXP(guildId);
          const ranked = rows.map(r => {
            const { level, xpIntoLevel } = calculateLevel(r.xp);
            return { userId: r.userId, level, xpIntoLevel };
          })
          .sort((a,b)=> b.level - a.level || b.xpIntoLevel - a.xpIntoLevel)
          .slice(0,10);
          const desc = ranked.length
            ? ranked.map((r,i)=>`${i+1}. <@${r.userId}> — Lv ${r.level} (${r.xpIntoLevel})`).join('\n')
            : 'Chưa có dữ liệu.';
          embed = new EmbedBuilder()
            .setTitle('🎖️ Top Level')
            .setDescription(desc)
            .setColor('Gold');
  
        } else { // lb_xp
          // Top XP
          const top = xpDB.topXP(guildId, 10);
          const desc = top.length
            ? top.map((r,i)=>`${i+1}. <@${r.userId}> — ${r.xp} XP`).join('\n')
            : 'Chưa có dữ liệu.';
          embed = new EmbedBuilder()
            .setTitle('💎 Top XP')
            .setDescription(desc)
            .setColor('Purple');
        }
  
        // 6) Cập nhật message (embed mới, vẫn giữ nút)
        await btn.update({ embeds: [embed], components: [row] });
      });
  
      collector.on('end', async () => {
        // Disable nút khi timeout
        const disabled = new ActionRowBuilder()
          .addComponents(row.components.map(b => b.setDisabled(true)));
        await msg.edit({ components: [disabled] });
      });
    }
  };
  