import { Command } from "../../structures/Command";

export default new Command({
    name: 'loop',
	description: 'Coloca en bucle un audio.',
    run: async ({ interaction, client }) => {
        let queue = client.distube.getQueue(interaction.guildId);
        client.distube.setRepeatMode(queue, 1)
        if(queue.repeatMode === 1){
            interaction.editReply('Loop activado.')
        }else{
            interaction.editReply('Loop desactivado.')
        }  
    }
});