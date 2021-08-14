const { MessageActionRow, MessageSelectMenu, MessageEmbed } = require('discord.js');

const { glob } = require('glob');
const { promisify } = require('util');
const globPromise = promisify(glob);

const config = require('./../../config.json');

const path = require('path');
const fileName = path.join(__dirname, './../../config.json');

LANGUAGE = config['language'];
const i18n = require('i18n');
const fs = require('fs');
i18n.setLocale(LANGUAGE);    

const available_langs = [];
const language = {
    en: 'Inglés',
    es: 'Español',
};

module.exports = {
    name: 'language',
    description: 'Change the current language of Nadeshiko',
    args: false,
    run: async (client, interaction) =>{

        // Get current available languages
        const languageFiles = await globPromise(`${process.cwd()}/languages/*.json`);
        languageFiles.map((value) => {
            const splitted = value.split('/');
            available_langs.push(splitted[splitted.length - 1].slice(0, -5));            
        });

        const languageEmbed = new MessageEmbed()
        .setTitle(i18n.__('language.title_embed'))
        .setColor('#e791d0');
        
        const row = new MessageActionRow()
        .addComponents(
            new MessageSelectMenu()
                .setCustomId('select_language')
                .setPlaceholder('Seleccione un lenguaje')
                .addOptions(
                    languageFiles.map((value) => {
                        const splitted = value.split('/');
                        return {
                            label: language[splitted[splitted.length - 1].slice(0, -5)],
                            value: splitted[splitted.length - 1].slice(0, -5),
                        };
                    }),
                ),
        );
        await interaction.editReply({ embeds: [languageEmbed], components: [row] });

        client.on('interactionCreate', interaction => {
            if (!interaction.isSelectMenu()) return;
            console.log(interaction.values);
            if (interaction.customId === 'select_language') {
                interaction.update({ content: '¡El lenguaje ha sido cambiado! Reinciando Nadeshiko...', components: [] });
                updateFile(fileName, interaction.values.toString());
            }
        });
    },
};


function updateFile(fileName, language_selection) {
    const file = require(fileName);

    file.language = language_selection.toLowerCase();
  
    fs.writeFile(
      fileName,
      JSON.stringify(file, null, 2),
      function writeJSON(err) {
        if (err) return console.log(err);
        console.log(JSON.stringify(file));
      },
    );
  
  }