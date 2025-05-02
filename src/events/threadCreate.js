// src/events/threadCreate.js
const { Events, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const FORUM_CHANNEL_ID = '1364486333560651876';

module.exports = {
  name: Events.ThreadCreate,
  async execute(thread) {
    // Chỉ áp dụng với forum channel hỏi bài
    if (thread.parentId !== FORUM_CHANNEL_ID) return;

    // Tạo 2 nút: "Trả lời" và "Xong"
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('answer_question')
        .setLabel('Trả lời')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('done_question')
        .setLabel('Xong')
        .setStyle(ButtonStyle.Success)
    );

    // Gửi thẳng tin nhắn vào thread (đảm bảo nút luôn xuất hiện dù starter có phải ảnh)
    await thread.send({
      content: 'Nhấn “Trả lời” để nhận trả lời, hoặc “Xong” khi bạn đã hoàn thành trả lời.',
      components: [row]
    });
  }
};
