const {distube} = require('./play.js')

module.exports = {
	name: 'loop',
	description: 'Loop a song.',
	run: async (client, interaction) => {
        let queue = distube.getQueue(interaction.guildId);
        distube.setRepeatMode(queue, 1)
        if(queue.repeatMode === 1){
            interaction.editReply('Loop activado.')
        }else{
            interaction.editReply('Loop desactivado.')
        }
    }
}