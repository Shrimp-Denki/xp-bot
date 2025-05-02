// src/events/guildMemberAdd.js
const { Events, AttachmentBuilder, ChannelType } = require('discord.js');
const Canvas = require('canvas');
const xpCfg = require('../config/xp');
const xpDB  = require('../managers/xp');

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member) {
    const guild = member.guild;
    const client = member.client;

    // --- 1) Xác định inviter ---
    const oldInvites = client.invites.get(guild.id);
    let newInvites;
    try {
      newInvites = await guild.invites.fetch();
      client.invites.set(guild.id, newInvites);
    } catch (err) {
      console.error('❌ Fetch invites lỗi:', err);
    }

    let inviterId;
    if (oldInvites && newInvites) {
      const usedInvite = newInvites.find(inv => {
        const prev = oldInvites.get(inv.code);
        return prev && inv.uses > prev.uses;
      });
      inviterId = usedInvite?.inviter?.id;
    }

    // --- 2) Cộng XP nếu có inviter ---
    if (inviterId) {
      const amount = xpCfg.inviteXP;
      if (amount > 0) {
        xpDB.addXP(inviterId, guild.id, amount);
        xpDB.addTodayXP(inviterId, guild.id, amount);
        // Log nếu có config
        if (xpCfg.logChannelId) {
          const logCh = guild.channels.cache.get(xpCfg.logChannelId);
          if (logCh?.isTextBased()) {
            logCh.send(`📨 <@${inviterId}> đã mời 1 người mới và nhận **${amount} XP**.`);
          }
        }
      }
    }

    // --- 3) Vẽ thẻ chào mừng với Canvas ---
    const channel = guild.channels.cache.get('1363034357547139143');
    if (!channel || channel.type !== ChannelType.GuildText) return;

    const studentCount = guild.members.cache.filter(m => !m.user.bot).size;
    const width = 800, height = 300;
    const canvas = Canvas.createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // nền trắng
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // tiêu đề
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 36px Sans';
    const title = 'THẺ HỌC SINH';
    const tw = ctx.measureText(title).width;
    ctx.fillText(title, (width - tw) / 2, 60);

    // avatar
    const avatarURL = member.user.displayAvatarURL({ extension:'png', size:256 });
    const avatar = await Canvas.loadImage(avatarURL);
    const aSize = 180, aX = 100, aY = 100;
    ctx.save();
    ctx.beginPath();
    ctx.arc(aX + aSize/2, aY + aSize/2, aSize/2, 0, Math.PI*2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, aX, aY, aSize, aSize);
    ctx.restore();

    // tên hiển thị
    const displayName = member.displayName;
    const username    = member.user.username;
    const nameToShow  = (displayName && displayName !== username)
      ? `${displayName} (${username})`
      : username;
    ctx.fillStyle = '#000000';
    ctx.font = '28px Sans';
    ctx.fillText(nameToShow, 350, 150);

    // ngày join và thứ tự học sinh
    ctx.font = '22px Sans';
    const joinedDate = new Date().toLocaleDateString('vi-VN');
    ctx.fillText(`Ngày gia nhập: ${joinedDate}`, 350, 190);
    ctx.fillText(`Là học sinh thứ #${studentCount}`, 350, 230);

    // gửi ảnh
    const attachment = new AttachmentBuilder(canvas.toBuffer(), { name:'welcome-card.png' });
    channel.send({
      content: `Chào mừng <@${member.id}> đến với server!`,
      files: [attachment]
    });
  }
};
