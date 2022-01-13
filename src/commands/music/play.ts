import { Command } from "../../structures/Command";
import { ExtendedClient } from "../../structures/Client";
export const client = new ExtendedClient();
const { SpotifyPlugin } = require("@distube/spotify");
const { MessageEmbed } = require('discord.js');
const DisTube = require('distube');

export const distube = new DisTube.default(client, {
    plugins: [new SpotifyPlugin()],
    updateYouTubeDL: false,
});

let lastInteraction = null;

export default new Command({
	name: 'play',
	description: 'Reproduce un audio.',
    options: [
        {
        name: 'song',
        description: 'URL or name!',
        type: 'STRING',
        required: true,
        },
      ],
    run: async ({ interaction, client }) => {
        let voice = interaction.member.voice.channel;
        let song = interaction.options.getString('song');

        if (!interaction.member.voice.channel) {
            await interaction.editReply('Necesitas estar en un canal de voz.');
            return;
        }
        try {
            await playSong(interaction, voice, song);
        } catch (error) {
            interaction.editReply('Video no disponible.')
        }
        
        try {
            let queue = await distube.getQueue(interaction.guildId);                
            interaction.editReply(`Se ha añadido la canción: \`${queue.songs[queue.songs.length-1].name}\` - \`${queue.songs[queue.songs.length-1].formattedDuration}\`.`)
            

        } catch (error) {
            console.log(error)
        }


	},
});

async function playSong(interaction, voice, song){
    lastInteraction = interaction;
    await distube.playVoiceChannel(voice, song, {textChannel: interaction.channel});
}


distube.on("playSong", async (queue, song) => {
        const playEmbed = new MessageEmbed()
        .setColor('eb868f')
        .setTitle(`**Reproduciendo audio**`)
        .setDescription(`${song.name}`)
        .setThumbnail(song.thumbnail)
        .setTimestamp()
        .setURL(song.url)
        queue.textChannel.send({ embeds: [playEmbed] })  
    
});

distube.on("error", (channel, error) => {
    console.log(error);
});