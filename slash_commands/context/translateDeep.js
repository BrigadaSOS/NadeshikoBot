const { MessageEmbed } = require('discord.js');
const deepl = require('../../utilities/deepPuppeter');
const deepApi = require('../../utilities/deepAPI');

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
       
        try {
            response = await deepApi.translateDeepApi(content_message);
            result = response.data.translations[0].text;
        } catch (error) {
            console.log(error);
            try {
                result = await deepl.translateService(content_message);
            } catch (error) {
                result = 'No ha sido posible traducir el mensaje.';
            }
        }

        embed.setDescription(`${result}\n\n[Link al mensaje original](${message.url})`)
            .setColor('#32a852')
            .setTitle('Resultado')
            .setAuthor('Mensaje original por ' + username_msg, message.author.displayAvatarURL(), message.url);

        interaction.editReply({ embeds: [embed] });
    },
};
