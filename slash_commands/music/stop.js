const {distube} = require('./play.js')

module.exports = {
	name: 'stop',
	description: 'Stop a queue.',
	run: async (client, interaction) => {
        let queue = distube.getQueue(interaction.guildId);
        distube.stop(queue)
        interaction.editReply('Se ha detenido la queue.')
    }
}