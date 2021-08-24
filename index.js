const { Client, Collection } = require('discord.js');
const path = require('path');
const i18n = require('i18n');
const dotenv = require('dotenv');
dotenv.config();

const client = new Client({
  intents: ['GUILDS', 
    'GUILD_MESSAGES', 
    'GUILD_PRESENCES', 
    'GUILD_VOICE_STATES', 
    'DIRECT_MESSAGES',
    'GUILD_INVITES',
    'GUILD_MESSAGE_REACTIONS',
    'DIRECT_MESSAGE_REACTIONS'],

  partials: ['MESSAGE', 
    'REACTION', 
    'CHANNEL', 
    'USER'],
});

// Language configuration
i18n.configure({
  directory: path.join(__dirname, './languages'),
  objectNotation: true,
  register: global,

  logWarnFn: function(msg) {
    console.log('warn', msg);
  },

  logErrorFn: function(msg) {
    console.log('error', msg);
  },

  missingKeyFn: function(locale, value) {
    return value;
  },
});

// Slash commands configuration
module.exports = client;
client.slashCommands = new Collection();
require('./handler')(client);

// Login bot to Discord
client.login(process.env.DISCORD_TOKEN);
