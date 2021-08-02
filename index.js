// Required Variables Config
const { Client, Collection } = require("discord.js");
const Discord = require("discord.js");
const client = new Client({
  intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_PRESENCES", "GUILD_VOICE_STATES", "DIRECT_MESSAGES","GUILD_INVITES"],
  partials: ["MESSAGE", "REACTION", "CHANNEL", "USER"],
});

require("dotenv").config();
const path = require("path");
const schedule = require('node-schedule');

const { prefix } = require("./config.json");
const i18n = require("i18n");

const fs = require("fs");
const commandFolders = fs.readdirSync("./commands");

// Slash Commands config
module.exports = client;
client.commands = new Discord.Collection();
client.slashCommands = new Collection();
require("./handler")(client);

const job = schedule.scheduleJob({hour: 6, minute: 30, dayOfWeek: 3}, async function(){
  const attachment1 = new Discord.MessageAttachment("./assets/out_of_touch.mp4"); // create an attachment from a URL
  await client.channels.cache.get('796869756908732438').send({ files: [attachment1] });
  await client.channels.cache.get('796869756908732438').send("¡Feliz jueves!");
});

// Get commands by file in their folder
for (const folder of commandFolders) {
  const commandFiles = fs
    .readdirSync(`./commands/${folder}`)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const command = require(`./commands/${folder}/${file}`);
    client.commands.set(command.name, command);
  }
}

// Listener of messages from users
client.on("messageCreate", (message) => {
  // Doesn't accept messages without prefix or bot
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command =
    client.commands.get(commandName) ||
    client.commands.find(
      (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
    );

  if (!command) return;
  try {
    if (command.permissions) {
      const authorPerms = message.channel.permissionsFor(message.author);
      if (!authorPerms || !authorPerms.has(command.permissions)) {
        return message.reply("No tiene permisos para usar este comando.");
      }
    }
    command.execute(message, args, client);
  } catch (error) {
    console.error(error);
  }
});

// Language config Bot
i18n.configure({
  locales: ["en", "es"],
  directory: path.join(__dirname, "./language"),
  defaultLocale: "en",
  objectNotation: true,
  register: global,

  logWarnFn: function (msg) {
    console.log("warn", msg);
  },

  logErrorFn: function (msg) {
    console.log("error", msg);
  },

  missingKeyFn: function (locale, value) {
    return value;
  },
});

// Login bot to Discord
client.login(process.env.DISCORD_TOKEN);
