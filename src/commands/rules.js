// src/commands/rules.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const xpCfg = require('../config/xp');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rules')
    .setDescription('Xem luật đua XP toàn server'),
  async execute(interaction) {
    const channelMultipliers = xpCfg.channelMultipliers || {};
    const levelMultipliers   = xpCfg.levelMultipliers || {};
    const bonusActions       = xpCfg.bonusActions || {};
    const levelUpBonuses     = xpCfg.levelUpBonuses || {};

    const embed = new EmbedBuilder()
      .setTitle('📜 Luật đua XP')
      .addFields(
        { 
          name: '• XP tin nhắn gốc',
          value: `${xpCfg.baseMessageXP ?? 0}`, 
        },
        { 
          name: '• Channel multipliers',
          value:
            Object.entries(channelMultipliers)
              .map(([channelId, m]) => `<#${channelId}> → ${m}x`)
              .join('\n') || 'Không có'
        },
        { 
          name: '• Role multipliers',
          value:
            Object.entries(levelMultipliers)
              .map(([roleId, m]) => `<@&${roleId}> → ${m}x`)
              .join('\n') || 'Không có'
        },
        { 
          name: '• Bonus actions',
          value:
            Object.entries(bonusActions)
              .map(([key, x]) => `${key} → +${x} XP`)
              .join('\n') || 'Không có'
        },
        { 
          name: '• Level-up bonuses',
          value:
            Object.entries(levelUpBonuses)
              .map(([lvl, b]) => `Lv.${lvl} → +${b} XP`)
              .join('\n') || 'Không có'
        }
      )
      .setColor('Blue');

    await interaction.reply({ embeds: [embed] });
  }
};
