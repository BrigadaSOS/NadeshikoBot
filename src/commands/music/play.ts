import { Command } from "../../structures/Command";
import { ExtendedClient } from "../../structures/Client";
export const client = new ExtendedClient();
const { SpotifyPlugin } = require("@distube/spotify");

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
            await playSong(interaction, voice, song, client);
        } catch (error) {
            interaction.editReply('Video no disponible.')
        }
        
        try {
            let queue = client.distube.getQueue(interaction.guildId);                
            interaction.editReply(`Se ha añadido la canción: \`${queue.songs[queue.songs.length-1].name}\` - \`${queue.songs[queue.songs.length-1].formattedDuration}\`.`)
            

        } catch (error) {
            console.log(error)
        }


	},

});

async function playSong(interaction, voice, song, client){
    lastInteraction = interaction;
    await client.distube.play(voice, song, {textChannel: interaction.channel});
}

