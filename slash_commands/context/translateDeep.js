const deepl = require('../../utilities/translateDeepL');
const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'Translate-DeepL',
    type: 'MESSAGE',
	run: async (client, interaction) => {
        const embed = new MessageEmbed();

        const message = interaction.options.getMessage('message');
        username_msg = message.author.username + '#' + message.author.discriminator;
        result = await deepl.translateService(message.content);

        embed.setDescription(result)
            .setColor('#32a852')
            .setAuthor(username_msg, message.author.displayAvatarURL(), message.url);

        interaction.editReply({ embeds: [embed] });
    },
};