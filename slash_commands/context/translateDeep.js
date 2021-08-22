const { MessageEmbed, MessageActionRow, MessageSelectMenu } = require('discord.js');
const deepl = require('../../utilities/deepPuppeter');
const deepApi = require('../../utilities/deepAPI');
const wait = require('util').promisify(setTimeout);

const language = {
    en: 'Inglés',
    es: 'Español',
};

module.exports = {
	name: 'Translate-DeepL',
    type: 'MESSAGE',
	run: async (client, interaction) => {
        const embed = new MessageEmbed();

        const message = interaction.options.getMessage('message');
        username_msg = message.author.username + '#' + message.author.discriminator;

        try {
            content_embed = message.embeds[0].description;
        } catch (error) {
            content_embed = null;
        }
        
        if(content_embed != null) {
            content_message = content_embed;
        }else{
            content_message = message.content;
        }
        
        // Selector language
        const row = new MessageActionRow()
        .addComponents(
            new MessageSelectMenu()
                .setCustomId('select')
                .setPlaceholder('Nada seleccionado')
                .addOptions([
                    {
                        label: 'Español',
                        value: 'es',
                    },
                    {
                        label: 'Inglés',
                        value: 'en',
                    },
                    {
                        label: 'Japonés',
                        value: 'ja',
                    },
                ]),
        );
            
        await interaction.editReply({ content: '¿Qué idioma desea escoger para la traducción?', components: [row] });   
        const message2 = await interaction.fetchReply();

            client.on('interactionCreate', async interaction2 => {
                if (interaction2.customId === 'select') {
                console.log(interaction2);

                try {
                    response = await deepApi.translateDeepApi(content_message, interaction2.values[0]);
                    result = response.data.translations[0].text;
                } catch (error) {
                    console.log(error);
                    try {
                        result = await deepl.translateService(content_message);
                    } catch (error) {
                        result = 'No ha sido posible traducir el mensaje.';
                    }
                }
                embed.setDescription(`${result}`)
                .setColor('#32a852')
                .setFooter('Traducción solicitada por: ' + interaction.user.username)
                .setAuthor('Mensaje original por ' + username_msg, message.author.displayAvatarURL(), message.url);
                await interaction.deleteReply();
                message2.channel.send({ embeds: [embed], components: [], content: null });
                
            }

        });
    },
};
