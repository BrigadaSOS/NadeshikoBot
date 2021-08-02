const { CommandInteraction, MessageActionRow, MessageSelectMenu, Client, Discord } = require("discord.js");
module.exports = {
    name: "help",
    description: "Show help.",
    args: false,
    run: async (client, interaction, args) => {
    // Help Message Bot
      const Discord = require("discord.js");
      const fs = require("fs");
      var config = JSON.parse(fs.readFileSync("./config.json"));
      const { MessageActionRow, MessageButton } = require('discord.js');

      // Language
      LANGUAGE = config["language"];
      const i18n = require("i18n");
      i18n.setLocale(LANGUAGE);
  
      const helpEmbed = new Discord.MessageEmbed()
        .setTitle(i18n.__("help.title_embed"))
        .setColor("#e791d0")
        .setThumbnail(
          "https://media.discordapp.net/attachments/800067393665761310/845936433599610900/47178d15bc22e5c8fb15e0259a832db3.png"
        )
        .addFields(
          {
            name: "n!tweet <username>",
            value: i18n.__("help.tweet_description"),
          },
          {
            name: "n!purge <cantidad>",
            value: i18n.__("help.purge_description"),
          },
          {
            name: "n!scan <imagen>",
            value: i18n.__("help.scan_description"),
          },
          {
            name: "n!avatar <username>",
            value: i18n.__("help.avatar_description"),
          },
          {
            name: "n!ping",
            value: i18n.__("help.ping_description"),
          },
          {
            name: "n!language",
            value: i18n.__("help.language_description"),
          }
        );

        const row = new MessageActionRow()
        .addComponents(
          new MessageSelectMenu()
            .setCustomId('select')
            .setPlaceholder('Nothing selected')
            .addOptions([
              {
                label: 'Select me',
                description: 'This is a description',
                value: 'first_option',
              },
              {
                label: 'You can select me too',
                description: 'This is also a description',
                value: 'second_option',
              },
            ]),
        );
          
      await interaction.editReply({ content: 'Ayuda', ephemeral: false, embeds: [helpEmbed], components: [row] });
      interaction.editReply({ embeds: [helpEmbed] });
    },
  };
  