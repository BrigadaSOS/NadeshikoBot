const DisTube = require('distube')
const client = require('../../index');
const ytdl = require('ytdl-core');
const { MessageEmbed } = require('discord.js');

const { SpotifyPlugin } = require("@distube/spotify");
const distube = new DisTube.default(client, {
    plugins: [new SpotifyPlugin()],
    updateYouTubeDL: false,
});

let lastInteraction = null;

module.exports = {
	name: 'play',
	description: 'Play any song.',
    options: [
        {
        name: 'song',
        description: 'URL or name!',
        type: 'STRING',
        required: true,
        },
      ],
	run: async (client, interaction) => {
        let voice = interaction.member.voice.channel;
        let song = interaction.options.getString('song');

        if (!interaction.member.voice.channel) {
            await interaction.editReply('Necesitas estar en un canal de voz.');
            return;
        }

        await playSong(interaction, voice, song);

	},
    distube,
};

async function playSong(interaction, voice, song){
    lastInteraction = interaction;
    distube.playVoiceChannel(voice, song, {textChannel: interaction.channel});
}


distube.on("playSong", async (queue, song) => {
    const playEmbed = new MessageEmbed()
    .setColor('eb868f')
    .setTitle(`**Reproduciendo audio**`)
    .setDescription(`${song.name}`)
    .setThumbnail(song.thumbnail)
    .setTimestamp();
    lastInteraction.editReply({ embeds: [playEmbed] });   
});

distube.on("addSong", async (queue, song) => {
    queue.textChannel.send(`Se ha añadido la canción: \`${song.name}\` - \`${song.formattedDuration}\`.`)
});

distube.on("error", (channel, error) => {
    console.log(error);
});