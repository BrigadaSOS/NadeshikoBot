import { Command } from "../../structures/Command";
const { distube } = require('./play.ts')

export default new Command({
    name: 'skip',
	description: 'Omite un audio.',
    run: async ({ interaction, client }) => {
        const queue = distube.getQueue(interaction.guildId);

        if(!queue){
            return interaction.editReply('No hay queue disponible.')
        }

        if(queue.songs.length === 1){
            queue.stop()
            interaction.editReply('Audio omitido. No hay más audios en el queue.')
        }else if(queue.songs.length >1){
            queue.skip();
            interaction.editReply(`El audio \`${queue.songs[0].name}\` ha sido omitido.\nSiguiente audio: \`${queue.songs[1].name}\` - \`${queue.songs[queue.songs.length-1].formattedDuration}\`.`)
        }else if(!queue.autoplay && queue.songs.length <= 0){
            return;
        }
    
    }
});