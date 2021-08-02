const config = require("./../../config.json");
const fs = require("fs");
const Discord = require("discord.js");

const language = {
    ES: 'Español',
    EN: 'Inglés'
}

module.exports = {
    name: "language",
    description: "Change the current language of Nadeshiko",
    args: true,
    options: [
      {
      name: "language",
      description: "What language would you like to use?",
      type: "STRING",
      required: false,
      },
    ],
    run: async(client, interaction, args) =>{
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
            interaction.editReply({ embeds: [languageEmbed] });
        });

    },
}