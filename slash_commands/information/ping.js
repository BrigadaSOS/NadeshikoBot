const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'ping',
	description: 'Show the current ping of Nadeshiko.',

	run: async (client, interaction) => {
		const message = await interaction.fetchReply();
		const embed = new MessageEmbed()
			.setTitle('Ping')
			.setDescription(`Latencia del bot: ${message.createdTimestamp - interaction.createdTimestamp}ms.\nLatencia API: ${Math.round(interaction.client.ws.ping)}ms.`)
			.setColor('eb868f');
		interaction.editReply({ embeds: [embed] });
	},
};