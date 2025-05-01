const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const Canvas = require('canvas');
const xpDB = require('../managers/xp');
const { calculateLevel } = require('../managers/level');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('👤 View your profile and stats.'),
  async execute(interaction) {
    const user = interaction.user;
    const guildId = interaction.guild.id;
    const totalXP = xpDB.getXP(user.id, guildId);
    const { level, xpIntoLevel, xpNeeded } = calculateLevel(totalXP);

    // Canvas
    const width = 800, height = 300;
    const canvas = Canvas.createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0,0,width,height);
    ctx.fillStyle = '#000'; ctx.font = 'bold 36px Sans';
    const title = 'THẺ HỌC SINH';
    ctx.fillText(title, (width - ctx.measureText(title).width)/2, 60);

    const avatarURL = user.displayAvatarURL({ extension: 'png', size: 256 });
    const avatar = await Canvas.loadImage(avatarURL);
    const avatarSize = 180;
    const avatarX = 50, avatarY = 100;
    ctx.save(); ctx.beginPath();
    ctx.arc(avatarX+avatarSize/2, avatarY+avatarSize/2, avatarSize/2, 0, Math.PI*2);
    ctx.closePath(); ctx.clip();
    ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
    ctx.restore();

    ctx.fillStyle = '#000'; ctx.font = '28px Sans';
    ctx.fillText(user.username, avatarX+avatarSize+40, avatarY+40);
    const joinDate = interaction.member.joinedAt.toLocaleDateString('vi-VN');
    ctx.font = '22px Sans';
    ctx.fillText(`Joined: ${joinDate}`, avatarX+avatarSize+40, avatarY+80);
    ctx.fillText(`Level: ${level}`, avatarX+avatarSize+40, avatarY+110);
    const progressText = `${xpIntoLevel}/${xpNeeded} XP`;
    ctx.fillText(progressText, avatarX+avatarSize+40, avatarY+140);

    // Progress bar
    const barX = avatarX+avatarSize+40, barY = avatarY+160;
    const barW = 400, barH = 20;
    ctx.strokeStyle='#000'; ctx.lineWidth=2; ctx.strokeRect(barX, barY, barW, barH);
    ctx.fillStyle='#00AAFF'; ctx.fillRect(barX, barY, (xpIntoLevel/xpNeeded)*barW, barH);

    const buffer = canvas.toBuffer();
    const attachment = new AttachmentBuilder(buffer, { name: 'profile-card.png' });
    await interaction.reply({ files: [attachment] });
  }
};