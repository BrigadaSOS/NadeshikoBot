import { Command } from "../../structures/Command";
const { MessageEmbed } = require('discord.js');

export default new Command({
	name: 'queue',
	description: 'Lista de audios en la queue.',
    run: async ({ interaction, client }) => {

        let queue = client.distube.getQueue(interaction.guildId);
        if(!queue){
            return interaction.editReply('No hay contenido en el queue.')
        }
        let result = '';
        for (let i = 1; i < queue.songs.length; i++) {
            console.log(queue.songs[i].name)
            result += `**${i})** ${queue.songs[i].name} | ${queue.songs[i].formattedDuration}\n`
        }

        let base_text = 
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
});