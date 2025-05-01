const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const xpCfg = require('../config/xp');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rules')
    .setDescription('Xem luật đua XP toàn server'),
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('📜 Luật đua XP')
      .addFields(
        { name:'• XP tin nhắn gốc', value:`${xpCfg.baseMessageXP}` },
        { name:'• Channel multipliers', value:
            Object.entries(xpCfg.channelMultipliers)
              .map(([ch,m])=>`<#${ch}> → ${m}x`).join('\n')
        },
        { name:'• Role multipliers', value:
            Object.entries(xpCfg.levelMultipliers)
              .map(([r,m])=>`<@&${r}> → ${m}x`).join('\n')
        },
        { name:'• Bonus actions', value:
            Object.entries(xpCfg.bonusActions)
              .map(([k,x])=>`${k} → +${x} XP`).join('\n')
        },
        { name:'• Level-up bonuses', value:
            Object.entries(xpCfg.levelUpBonuses)
              .map(([l,b])=>`Lv.${l} → +${b} XP`).join('\n')
        }
      )
      .setColor('Blue');

    await interaction.reply({ embeds: [embed] });
  }
};
