import { Command } from "../../structures/Command";
const { distube } = require('./play.ts')

export default new Command({
    name: 'loop',
	description: 'Coloca en bucle un audio.',
    run: async ({ interaction, client }) => {
        let queue = distube.getQueue(interaction.guildId);
        distube.setRepeatMode(queue, 1)
        if(queue.repeatMode === 1){
            interaction.editReply('Loop activado.')
        }else{
            interaction.editReply('Loop desactivado.')
        }  
    }
});