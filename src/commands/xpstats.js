// src/commands/xpstats.js
const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const Canvas = require('canvas');
const xpDB = require('../managers/xp');
const { calculateLevel } = require('../managers/level');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('xpstats')
    .setDescription('Xem thẻ XP chi tiết (canvas) của bạn hoặc người khác.')
    .addUserOption(o =>
      o.setName('user')
       .setDescription('Chọn user (mặc định là bạn)')
    ),
  async execute(interaction) {
    const target  = interaction.options.getUser('user') || interaction.user;
    const guildId = interaction.guild.id;
    const totalXP = xpDB.getXP(target.id, guildId);
    const monthly = xpDB.getMonthlyXP(target.id, guildId);
    const { level, xpIntoLevel, xpNeeded } = calculateLevel(totalXP);

    // --- vẽ Canvas ---
    const width = 800, height = 300;
    const canvas = Canvas.createCanvas(width, height);
    const ctx    = canvas.getContext('2d');

    // nền trắng
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0,0,width,height);

    // tiêu đề
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 36px Sans';
    const title = 'THẺ HỌC SINH';
    ctx.fillText(title, (width - ctx.measureText(title).width)/2, 60);

    // avatar
    const avatar = await Canvas.loadImage(
      target.displayAvatarURL({ extension: 'png', size: 256 })
    );
    const aSize = 180, aX = 50, aY = 100;
    ctx.save();
    ctx.beginPath();
    ctx.arc(aX+aSize/2, aY+aSize/2, aSize/2, 0, Math.PI*2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, aX, aY, aSize, aSize);
    ctx.restore();

    // text info
    ctx.fillStyle = '#000000';
    ctx.font = '28px Sans';
    ctx.fillText(target.username, aX + aSize + 40, aY + 40);
    ctx.font = '22px Sans';
    ctx.fillText(`Total XP: ${totalXP} (Monthly: ${monthly})`, aX+aSize+40, aY+80);
    ctx.fillText(`Level ${level}: ${xpIntoLevel}/${xpNeeded} XP`, aX+aSize+40, aY+110);

    // thanh XP
    const barW = 400, barH = 20, barX = aX+aSize+40, barY = aY+140;
    ctx.strokeStyle = '#000';
    ctx.lineWidth   = 2;
    ctx.strokeRect(barX, barY, barW, barH);
    ctx.fillStyle = '#00AAFF';
    ctx.fillRect(barX, barY, (xpIntoLevel/xpNeeded)*barW, barH);

    const buffer     = canvas.toBuffer();
    const attachment = new AttachmentBuilder(buffer, { name:'xpstats-card.png' });
    await interaction.reply({ files: [attachment] });
  }
};
