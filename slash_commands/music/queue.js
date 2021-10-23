const {distube} = require('./play.js')
const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'queue',
	description: 'List of songs currenly in queue.',
	run: async (client, interaction) => {
        let queue = distube.getQueue(interaction.guildId);
        if(!queue){
            return interaction.editReply('No hay contenido en el queue.')
        }
        result = '';
        for (let i = 1; i < queue.songs.length; i++) {
            console.log(queue.songs[i].name)
            result += `**${i})** ${queue.songs[i].name} | ${queue.songs[i].formattedDuration}\n`
        }

        base_text = 
            `__Reproduciendo ahora__
            ${queue.songs[0].name} | ${queue.songs[0].formattedDuration}\n
            __A continuación__
            ${result}
            Canciones en queue: ${queue.songs.length-1} | Duración total: ${queue.formattedDuration}`
        const queueEmbed = new MessageEmbed()
        .setColor('eb868f')
        .setTitle(`**Queue**`)
        .setDescription(base_text)
        interaction.editReply({ embeds: [queueEmbed] });
    }
}