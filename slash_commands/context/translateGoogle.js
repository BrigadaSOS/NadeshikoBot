const translate = require('@iamtraction/google-translate');
const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'Translate-Google',
    type: 'MESSAGE',
	run: async (client, interaction) => {
        const embed = new MessageEmbed();

        const message = interaction.options.getMessage('message');
        username_msg = message.author.username + '#' + message.author.discriminator;
        result = await translate(message.content, { to: 'es' });
        embed.setDescription(result.text)
            .setColor('#32a852')
            .setAuthor(username_msg, message.author.displayAvatarURL(), message.url);

        interaction.editReply({ embeds: [embed] });
    },
};