const {distube} = require('./play.js')
const { MessageEmbed } = require('discord.js');
const bar = require(`stylish-text`);

module.exports = {
	name: 'nowplaying',
	description: 'Lorem ipsum.',
	run: async (client, interaction) => {
        let queue = distube.getQueue(interaction.guildId);
        const song = queue.songs[0];
        const name = song.name;
        const link = song.url;

        let end = song.duration;

        current_time = queue.currentTime;
        console.log(current_time)
        console.log(end)
        console.log(song.formattedDuration)

        old_value = current_time
        old_min = 0
        old_max = end
        new_min = 0
        new_max = 20

        new_value = ( (old_value - old_min) / (old_max - old_min) ) * (new_max - new_min) + new_min
        console.log(new_value);
        
        bar.default.full = "█"
        bar.default.empty = "-";
        bar.default.start = "";
        bar.default.end = "";
        bar.default.text = "{bar}";

        let nowplayingEmbed = new MessageEmbed()
        .setColor('eb868f')
        .setTitle(`**Reproduciendo ahora**`)
        .setDescription(`${song.name}\n
        ${queue.formattedCurrentTime} [${bar.progress(30,new_value)}] ${(song.formattedDuration)}`)
        .setThumbnail(song.thumbnail)
        .setTimestamp();

        interaction.editReply({ embeds: [nowplayingEmbed] });   
    }
}