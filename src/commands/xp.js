const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const Canvas = require('canvas');
const xpDB = require('../managers/xp');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('xp')
    .setDescription('View your current XP card.'),
  async execute(interaction) {
    const user = interaction.user;
    const guildId = interaction.guild.id;
    const totalXP = xpDB.getXP(user.id, guildId);
    const next = (Math.floor(Math.sqrt(2 * totalXP)) + 1) * 100; // example

    const width = 800, height = 300;
    const canvas = Canvas.createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle='#fff'; ctx.fillRect(0,0,width,height);
    ctx.fillStyle='#000'; ctx.font='bold 36px Sans';
    const title='THẺ HỌC SINH'; ctx.fillText(title, (width-ctx.measureText(title).width)/2,60);

    const avatarURL=user.displayAvatarURL({ extension:'png', size:256 });
    const avatar=await Canvas.loadImage(avatarURL);
    const aSize=180, aX=50, aY=100;
    ctx.save(); ctx.beginPath();
    ctx.arc(aX+aSize/2,aY+aSize/2,aSize/2,0,Math.PI*2);
    ctx.closePath(); ctx.clip();
    ctx.drawImage(avatar,aX,aY,aSize,aSize);
    ctx.restore();

    ctx.fillStyle='#000'; ctx.font='28px Sans';
    ctx.fillText(user.username,aX+aSize+40,aY+40);
    ctx.font='22px Sans'; ctx.fillText(`XP: ${totalXP}`,aX+aSize+40,aY+80);
    ctx.fillText(`Next: ${next}`,aX+aSize+40,aY+110);

    const buffer=canvas.toBuffer();
    const attachment=new AttachmentBuilder(buffer,{ name:'xp-card.png' });
    await interaction.reply({ files:[attachment] });
  }
};