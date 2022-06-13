import { Command } from "../../structures/Command";
const { MessageEmbed } = require('discord.js');
const progressbar = require('string-progressbar');

export default new Command({
    name: 'nowplaying',
	description: 'Muestra el audio actual que está sonando.',
    run: async ({ interaction, client }) => {

        let queue;
        let song;

        try {
            queue = client.distube.getQueue(interaction.guildId);
            song = queue.songs[0];             
        } catch (error) {
            console.log(error);
            return interaction.editReply('No hay queue disponible.')
        }

        // Time in seconds
        let end_time = song.duration;
        let current_time = queue.currentTime;

        let slider = progressbar.filledBar(end_time, current_time, 10, '-', '█');

        let nowplayingEmbed = new MessageEmbed()
        .setColor('eb868f')
        .setTitle(`**Reproduciendo ahora**`)
        .setDescription(`${song.name}\n
        ${queue.formattedCurrentTime} [${slider[0]}] ${(song.formattedDuration)}`)
        .setThumbnail(song.thumbnail)
        .setTimestamp()
        .setURL(song.url);

        interaction.editReply({ embeds: [nowplayingEmbed] }); 
    }
});