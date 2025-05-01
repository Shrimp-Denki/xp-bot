const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const Canvas = require('canvas');
const xpDB = require('../managers/xp');
const { calculateLevel } = require('../managers/level');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('levels')
    .setDescription('Hiển thị Level hiện tại và XP cần cho cấp tiếp theo.'),
  async execute(interaction) {
    const user = interaction.user;
    const guildId = interaction.guild.id;
    const totalXP = xpDB.getXP(user.id, guildId);
    const { level, xpIntoLevel, xpNeeded } = calculateLevel(totalXP);

    // Canvas setup
    const width = 800, height = 300;
    const canvas = Canvas.createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Title
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 36px Sans';
    const title = 'THẺ HỌC SINH';
    const titleWidth = ctx.measureText(title).width;
    ctx.fillText(title, (width - titleWidth) / 2, 60);

    // Avatar
    const avatarURL = user.displayAvatarURL({ extension: 'png', size: 256 });
    const avatar = await Canvas.loadImage(avatarURL);
    const avatarSize = 180;
    const avatarX = 50, avatarY = 100;
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize/2, avatarY + avatarSize/2, avatarSize/2, 0, Math.PI * 2);
    ctx.closePath(); ctx.clip();
    ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
    ctx.restore();

    // Text on right
    ctx.fillStyle = '#000000';
    ctx.font = '28px Sans';
    const name = user.username;
    ctx.fillText(name, avatarX + avatarSize + 40, avatarY + 40);

    ctx.font = '22px Sans';
    const line2 = `Level: ${level}`;
    ctx.fillText(line2, avatarX + avatarSize + 40, avatarY + 80);

    const progressText = `${xpIntoLevel}/${xpNeeded} XP`;
    ctx.fillText(progressText, avatarX + avatarSize + 40, avatarY + 120);

    // Progress bar
    const barWidth = 400, barHeight = 20;
    const barX = avatarX + avatarSize + 40, barY = avatarY + 140;
    ctx.strokeStyle = '#000000'; ctx.lineWidth = 2;
    ctx.strokeRect(barX, barY, barWidth, barHeight);
    const filled = (xpIntoLevel / xpNeeded) * barWidth;
    ctx.fillStyle = '#00AAFF';
    ctx.fillRect(barX, barY, filled, barHeight);

    // Attachment
    const buffer = canvas.toBuffer();
    const attachment = new AttachmentBuilder(buffer, { name: 'levels-card.png' });

    await interaction.reply({ files: [attachment] });
  }
};