const {distube} = require('./play.js')
const lyricsFinder = require('@sujalgoel/lyrics-finder');
const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'lyrics',
	description: 'Lorem ipsum.',
    options: [
        {
        name: 'title',
        description: 'title of song',
        type: 'STRING',
        required: false,
        },
    ],
	run: async (client, interaction) => {
        let queue = distube.getQueue(interaction.guildId);
        let title = interaction.options.getString('title');

        lyricsFinder.LyricsFinder(title).then(data => {
            for(let i = 0; i < data.length; i += 4000) {
                const toSend = data.substring(i, Math.min(data.length, i + 4000));
                const message_embed1 = new MessageEmbed()
                    .setColor("eb868f")
                    .setTitle(`Lyrics ${title}`)
                    .setDescription(toSend);
                
                interaction.followUp({ embeds: [message_embed1] });   

            }

        });

    }
}