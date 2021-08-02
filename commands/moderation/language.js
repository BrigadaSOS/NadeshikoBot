const config = require("./../../config.json");
const fs = require("fs");
const Discord = require("discord.js");

module.exports = {
  name: "language",
  description: "",
  aliases: [],
  permissions: ["ADMINISTRATOR"],
  args: false,
  async execute(message, args) {
    // Setting the language of the command
    // Language
    LANGUAGE = config["language"];
    const i18n = require("i18n");
    i18n.setLocale(LANGUAGE);
  
    var languageEmbed = new Discord.MessageEmbed()
      .setTitle(i18n.__("language.title_embed"))
      .setColor("#e791d0");

    // Constants for get the path of the files
    const path = require("path");
    const fs = require("fs");
    const directoryPath = path.join(__dirname, "../../language");

    // Getting items from path of languages
    var array_languages = [];

    fs.readdir(directoryPath, function (err, files) {
      //handling error
      if (err) {
        return console.log("Imposible de escanear directorio: " + err);
      }
      // Listing all the files using forEach and insert them into an array
      files.forEach(function (file) {
        // Remove extension from a file name before insert it
        array_languages.push(
          file.split(".").slice(0, -1).join(".").toUpperCase()
        );
      });
      languageEmbed.setDescription(
        i18n.__(`language.available_lang_text`) + array_languages
      );
      message.channel.send({ embeds: [languageEmbed] });
    });
    // Await messages
    const filter = (m) => m.author.id == message.author.id;
    // Errors: ['time'] treats ending because of the time limit as an error

   
    message.channel
      .awaitMessages({ filter, max: 1, time: 10000, errors: ["time"] })
      .then((collected) => {
        const fileName = path.join(__dirname, "../../config.json");

        if (collected.first().content.toUpperCase() == "ES") {
          language_selection = collected.first().content.toUpperCase();
          writeFile(fileName, language_selection);
        } else if (collected.first().content.toUpperCase() == "EN") {
          language_selection = collected.first().content.toUpperCase();
          writeFile(fileName, language_selection);
        } else{
          return message.channel.send("Valor incorrecto. Se ha cerrado el proceso.")
        }

        LANGUAGE = config["language"];
        i18n.setLocale(LANGUAGE);
        languageEmbed.setTitle(i18n.__("language.title_embed"))
        .setColor("#e791d0");
        languageEmbed.setDescription(
          i18n.__("language.result_language") + language_selection
        );
  
        message.channel.send({ embeds: [languageEmbed] });
      })
      .catch((error) => {
        message.channel.send("Se ha superado el tiempo de espera.")
        console.log(error);
      });
  },
};

function writeFile(fileName, language_selection) {
  const file = require(fileName);

  file.language = language_selection.toLowerCase();

  fs.writeFile(
    fileName,
    JSON.stringify(file, null, 2),
    function writeJSON(err) {
      if (err) return console.log(err);
      console.log(JSON.stringify(file));
    }
  );

}
