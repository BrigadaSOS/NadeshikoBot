const {distube} = require('./play.js')

module.exports = {
	name: 'seek',
	description: 'Seek.',
    options: [
        {
        name: 'time',
        description: 'Time to seek!',
        type: 'INTEGER',
        required: true,
        },
    ],
	run: async (client, interaction) => {
        let queue = distube.getQueue(interaction.guildId);
        let time = interaction.options.getInteger('time');
        queue.seek(time);
        current_time = queue.formattedCurrentTime;
        interaction.editReply(`Posición actualizada: ${current_time}`)
    }
}