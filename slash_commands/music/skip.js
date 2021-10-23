const {distube} = require('./play.js')

module.exports = {
	name: 'skip',
	description: 'Skip a song.',
	run: async (client, interaction) => {
        let queue = distube.getQueue(interaction.guildId);
        if(queue.songs.length >= 1){
            queue.skip();
        }else{
            interaction.editReply('No hay más canciones.')
        }
    }
}