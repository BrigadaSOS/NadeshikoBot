const {distube} = require('./play.js')

module.exports = {
	name: 'filter',
	description: 'Filter for song.',
    options: [
        {
        name: 'type',
        description: 'disable | 3d | bassboost | echo | karaoke | nightcore | vaporwave | flanger | reverse | surround',
        type: 'STRING',
        required: true,
        },
      ],
	run: async (client, interaction) => {
        let queue = distube.getQueue(interaction.guildId);
        let type  = interaction.options.getString('type');
        queue.setFilter(type)
    },
}