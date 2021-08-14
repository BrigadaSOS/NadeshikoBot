const { DiscordTogether } = require('discord-together');
const client = require('../../index');

const discordTogether = new DiscordTogether(client);

module.exports = {
    name: 'together',
    description: 'Watch youtube in a voice channel together!',
    options: [
        {
        name: 'channel',
        description: 'channel you want to activite.',
        type: 'CHANNEL',
        required: true,
        },
    ],

    run: async (client, interaction, args) =>{
        const [ channelID ] = args;
        const channel = interaction.guild.channels.cache.get(channelID);
        if (channel == null) return interaction.followUp('No ha seleccionado un canal.');
        if(channel.type !== 'GUILD_VOICE') 
        {return interaction.followUp({
            content: 'Por favor, seleccione un canal de voz.',
        });}
        discordTogether
            .createTogetherCode(channelID, 'youtube')
            .then((x) => interaction.followUp(x.code));
    },
};