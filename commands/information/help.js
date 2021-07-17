module.exports = {
  name: "help",
  description: "Show help.",
  args: false,
  execute(message) {
    // Help Message Bot
    const Discord = require("discord.js");
    const fs = require("fs");
    var config = JSON.parse(fs.readFileSync("./config.json"));

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

    message.channel.send({ embeds: [helpEmbed] });
  },
};
