require('dotenv').config();

const {
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
  Events,
} = require('discord.js');
const fs   = require('fs');
const path = require('path');
const { table } = require('console');

/*─── Client ──────────────────────────────────────────────────────────*/
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildVoiceStates
  ],
  partials: [ Partials.Message, Partials.GuildMember ],
});

client.commands = new Collection();
// Invite tracking
client.invitesCache  = new Map(); // guildId → Collection<Invite>
client.invitedByMap  = new Map(); // memberId → inviterId

/*─── Load Commands ───────────────────────────────────────────────────*/
const commandsTable = [];
function walkCommands(dir) {
  for (const file of fs.readdirSync(dir)) {
    const loc = path.join(dir, file);
    if (fs.statSync(loc).isDirectory()) walkCommands(loc);
    else if (file.endsWith('.js')) {
      const cmd = require(loc);
      if (cmd.data && cmd.execute) {
        client.commands.set(cmd.data.name, cmd);
        commandsTable.push({
          Command: '/' + cmd.data.name,
          Description: cmd.data.description
        });
      }
    }
  }
}
walkCommands(path.join(__dirname, 'commands'));
console.log('\n=== COMMANDS LOADED ===');
commandsTable.length ? table(commandsTable) : console.log('No commands found.');

/*─── Load Events ─────────────────────────────────────────────────────*/
const eventsTable = [];
function walkEvents(dir) {
  for (const file of fs.readdirSync(dir)) {
    const loc = path.join(dir, file);
    if (fs.statSync(loc).isDirectory()) walkEvents(loc);
    else if (file.endsWith('.js')) {
      const evt = require(loc);
      if (evt.name && evt.execute) {
        if (evt.once) client.once(evt.name, (...a) => evt.execute(...a));
        else          client.on(evt.name, (...a) => evt.execute(...a));
        eventsTable.push({ Event: evt.name, Once: evt.once ? 'Yes' : 'No' });
      }
    }
  }
}
walkEvents(path.join(__dirname, 'events'));
console.log('\n=== EVENTS LOADED ===');
eventsTable.length ? table(eventsTable) : console.log('No events found.');

/*─── Invite Tracking on Ready ─────────────────────────────────────────*/
client.once(Events.ClientReady, async () => {
  console.log(`${client.user.tag} is online! Fetching invites…`);
  for (const guild of client.guilds.cache.values()) {
    try {
      const invs = await guild.invites.fetch();
      client.invitesCache.set(guild.id, invs);
    } catch (err) {
      console.error(`Fetch invites failed for ${guild.id}:`, err);
    }
  }
});

/*─── Interaction Create ───────────────────────────────────────────────*/
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const cmd = client.commands.get(interaction.commandName);
  if (!cmd) return;
  try {
    await cmd.execute(interaction);
  } catch (err) {
    console.error(err);
    if (!interaction.replied) {
      await interaction.reply({ content: '❌ Error executing command.', ephemeral: true });
    }
  }
});

/*─── Error Handling ──────────────────────────────────────────────────*/
process.on('unhandledRejection', console.error);
process.on('uncaughtException',  console.error);

/*─── Login ───────────────────────────────────────────────────────────*/
client.login(process.env.TOKEN)
  .then(() => console.log('✅ BOT ONLINE'))
  .catch(err => console.error('Login failed:', err));
