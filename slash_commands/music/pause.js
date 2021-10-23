const {distube} = require('./play.js')

module.exports = {
	name: 'pause',
	description: 'Pause/resume a song.',
	run: async (client, interaction) => {
        let queue = distube.getQueue(interaction.guildId);
        try {
            distube.pause(queue);
        } catch (DisTubeError) {
            console.log(DisTubeError)
            distube.resume(queue);
        }
    }
}