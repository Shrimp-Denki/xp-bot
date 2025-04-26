# Discord Bot Project (Node.js + Discord.js v14)

## Cài đặt

1. Sao chép file `.env.example` thành `.env` và điền thông tin bot của bạn:
```
TOKEN=your_discord_bot_token_here
CLIENT_ID=your_client_id_here
GUILD_ID=your_guild_id_here
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Đăng ký lệnh slash:
```bash
node src/deploy-commands.js
```

4. Khởi động bot:
```bash
node src/index.js
```

## Cấu trúc dự án

```
discord-bot-nodejs/
├── src/
│   ├── commands/       # Thư mục chứa các lệnh slash
│   ├── events/         # Thư mục chứa các event handler
│   ├── utils/          # Thư mục chứa các utility function
│   ├── index.js        # File chính của bot
│   └── deploy-commands.js  # Script đăng ký lệnh slash
├── .env                # File chứa biến môi trường (cần tạo từ .env.example)
├── .eslintrc.json      # Cấu hình ESLint
├── .prettierrc.json    # Cấu hình Prettier
└── package.json        # Cấu hình npm và dependencies
```

## Thêm lệnh mới

1. Tạo file mới trong thư mục `src/commands/`
2. Sử dụng mẫu sau:

```javascript
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tên-lệnh')
    .setDescription('Mô tả lệnh'),
  async execute(interaction) {
    // Xử lý lệnh ở đây
    await interaction.reply('Phản hồi của bạn ở đây');
  },
};
```

3. Sau khi thêm lệnh mới, chạy lại script đăng ký lệnh

## Thêm event mới

1. Tạo file mới trong thư mục `src/events/`
2. Sử dụng mẫu sau:

```javascript
const { Events } = require('discord.js');

module.exports = {
  name: Events.TênEvent,
  once: false, // true nếu event chỉ nên được xử lý một lần
  execute(...args) {
    // Xử lý event ở đây
  },
};
```

## Scripts

Thêm các script sau vào `package.json`:

```json
"scripts": {
  "start": "node src/index.js",
  "dev": "nodemon src/index.js",
  "deploy": "node src/deploy-commands.js",
  "lint": "eslint .",
  "format": "prettier --write \"src/**/*.js\""
}
```
