const fs = require("fs");
const {
  REST,
  Routes,
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
} = require("discord.js");

const { TOKEN, CLIENT_ID, TEST_GUILD_ID } = require("./bot-config");

/** ******************************************************************* */

/**
 * @type {import('./typings').Client}
 * @description Main Application Client */

// @ts-ignore
const client = new Client({
  // Please add all intents you need, more detailed information @ https://ziad87.net/intents/
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

/** ******************************************************************* */
// Below we will be making an event handler!

/**
 * @type {String[]}
 * @description All event files of the event handler.
 */

const eventFiles = fs
  .readdirSync("src/events")
  .filter((file) => file.endsWith(".js"));

// Loop through all files and execute the event when it is actually emmited.
for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, async (...args) => event.execute(...args, client));
  }
}

/** ******************************************************************* */
// Define Collection of Commands

client.slashCommands = new Collection();
client.buttonCommands = new Collection();
client.selectCommands = new Collection();
client.contextCommands = new Collection();
client.modalCommands = new Collection();
client.autocompleteInteractions = new Collection();
client.triggers = new Collection();

/** ******************************************************************* */
// Registration of Slash-Command Interactions.

/**
 * @type {String[]}
 * @description All slash commands.
 */

const slashCommands = fs.readdirSync("src/interactions/slash");

// Loop through all files and store slash-commands in slashCommands collection.

for (const module of slashCommands) {
  const commandFiles = fs
    .readdirSync(`src/interactions/slash/${module}`)
    .filter((file) => file.endsWith(".js"));

  for (const commandFile of commandFiles) {
    const command = require(`./interactions/slash/${module}/${commandFile}`);
    client.slashCommands.set(command.data.name, command);
  }
}

/** ******************************************************************* */
// Registration of Autocomplete Interactions.

/**
 * @type {String[]}
 * @description All autocomplete interactions.
 */

const autocompleteInteractions = fs.readdirSync(
  "src/interactions/autocomplete",
);

// Loop through all files and store autocomplete interactions in autocompleteInteractions collection.

for (const module of autocompleteInteractions) {
  const files = fs
    .readdirSync(`src/interactions/autocomplete/${module}`)
    .filter((file) => file.endsWith(".js"));

  for (const interactionFile of files) {
    const interaction = require(`./interactions/autocomplete/${module}/${interactionFile}`);
    client.autocompleteInteractions.set(interaction.name, interaction);
  }
}

/** ******************************************************************* */
// Registration of Context-Menu Interactions

/**
 * @type {String[]}
 * @description All Context Menu commands.
 */

const contextMenus = fs.readdirSync("src/interactions/context-menus");

// Loop through all files and store context-menus in contextMenus collection.

for (const folder of contextMenus) {
  const files = fs
    .readdirSync(`src/interactions/context-menus/${folder}`)
    .filter((file) => file.endsWith(".js"));
  for (const file of files) {
    const menu = require(`./interactions/context-menus/${folder}/${file}`);
    const keyName = `${folder.toUpperCase()} ${menu.data.name}`;
    client.contextCommands.set(keyName, menu);
  }
}

/** ******************************************************************* */
// Registration of Button-Command Interactions.

/**
 * @type {String[]}
 * @description All button commands.
 */

const buttonCommands = fs.readdirSync("src/interactions/buttons");

// Loop through all files and store button-commands in buttonCommands collection.

for (const module of buttonCommands) {
  const commandFiles = fs
    .readdirSync(`src/interactions/buttons/${module}`)
    .filter((file) => file.endsWith(".js"));

  for (const commandFile of commandFiles) {
    const command = require(`./interactions/buttons/${module}/${commandFile}`);
    client.buttonCommands.set(command.id, command);
  }
}

/** ******************************************************************* */
// Registration of Modal-Command Interactions.

/**
 * @type {String[]}
 * @description All modal commands.
 */

const modalCommands = fs.readdirSync("src/interactions/modals");

// Loop through all files and store modal-commands in modalCommands collection.

for (const module of modalCommands) {
  const commandFiles = fs
    .readdirSync(`src/interactions/modals/${module}`)
    .filter((file) => file.endsWith(".js"));

  for (const commandFile of commandFiles) {
    const command = require(`./interactions/modals/${module}/${commandFile}`);
    client.modalCommands.set(command.id, command);
  }
}

/** ******************************************************************* */
// Registration of select-menus Interactions

/**
 * @type {String[]}
 * @description All Select Menu commands.
 */

const selectMenus = fs.readdirSync("src/interactions/select-menus");

// Loop through all files and store select-menus in selectMenus collection.

for (const module of selectMenus) {
  const commandFiles = fs
    .readdirSync(`src/interactions/select-menus/${module}`)
    .filter((file) => file.endsWith(".js"));
  for (const commandFile of commandFiles) {
    const command = require(`./interactions/select-menus/${module}/${commandFile}`);
    client.selectCommands.set(command.id, command);
  }
}

/** ******************************************************************* */
// Registration of Slash-Commands in Discord API

const rest = new REST().setToken(TOKEN);

const updateSlashCommands = async (scope, reset) => {
  const commandJsonData = [
    ...Array.from(client.slashCommands.values()).map((c) => c.data.toJSON()),
    ...Array.from(client.contextCommands.values()).map((c) => c.data),
  ];

  const path =
    scope === "guild"
      ? Routes.applicationGuildCommands(CLIENT_ID, TEST_GUILD_ID)
      : Routes.applicationCommands(CLIENT_ID);

  try {
    console.log(
      `[${scope} - Reset: ${reset}] Started refreshing application (/) commands.`,
    );
    const body = reset ? [] : commandJsonData;
    await rest.put(path, { body });
    console.log(
      `[${scope} - Reset: ${reset}] Successfully reloaded application (/) commands.`,
    );
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};
if (TEST_GUILD_ID) {
  updateSlashCommands("guild", false);
}

/** ******************************************************************* */
// Registration of Message Based Chat Triggers

/**
 * @type {String[]}
 * @description All trigger categories aka folders.
 */

const triggerFolders = fs.readdirSync("src/triggers");

// Loop through all files and store triggers in triggers collection.

for (const folder of triggerFolders) {
  const triggerFiles = fs
    .readdirSync(`src/triggers/${folder}`)
    .filter((file) => file.endsWith(".js"));
  for (const file of triggerFiles) {
    const trigger = require(`./triggers/${folder}/${file}`);
    client.triggers.set(trigger.name, trigger);
  }
}

// Login into your client application with bot's token.
client.login(TOKEN);

module.exports = {
  updateSlashCommands,
};
