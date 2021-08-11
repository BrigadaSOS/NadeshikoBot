const { Client, Message, MessageEmbed, MessageActionRow, MessageSelectMenu } = require('discord.js');
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('./config.json'));

// Language configuration
LANGUAGE = config['language'];
const i18n = require('i18n');
i18n.setLocale(LANGUAGE);

module.exports = {
    name: 'help',
    description: 'Show help.',
    args: false,
    run: async (client, interaction, args) => {
      console.log(client.slashCommands.name)
      console.log(await client.slashCommands.map((cmd) => cmd.directory));
      const directories = [
        ...new Set(await client.slashCommands.map((cmd) => cmd.directory)),
      ];
      console.log(directories);
  
          
    },
  };
  