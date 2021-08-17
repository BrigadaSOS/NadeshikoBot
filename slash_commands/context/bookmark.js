const { MessageEmbed } = require('discord.js');
const dateFormat = require('dateformat');

module.exports = {
	name: 'Bookmark',
    type: 'MESSAGE',
	run: async (client, interaction) => {

        // Message, user and embed object
        const message = interaction.options.getMessage('message');
        const embed = new MessageEmbed();

        time_msg = `${dateFormat(message.createdAt, 'dd/mm/yy  |  HH:MM')}`;
        url_msg = message.url;

        try {
            type_msg = message.type;
            content_msg = message.content;
            username_msg = message.user.tag;
            image_msg = message.attachments.first().url;    
        } catch (error) {
            console.log(error);
        }


        embed.setAuthor(username_msg, message.author.displayAvatarURL());

        if (message.attachments.first() != null) {
            embed.setImage(image_msg);
        }
        
        if (content_msg != null) {
            embed.setDescription(content_msg);
        }

        embed.setTitle('Link original al mensaje');
        embed.setURL(url_msg);

        embed.setFooter(`Fecha de envio: ${time_msg}`)
            .setColor('e791d0');

        interaction.user.send({ embeds: [embed] }).then(msg => 
            msg.react('❌'));
        interaction.deleteReply();
	},
};