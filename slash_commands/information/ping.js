module.exports = {
	name: 'ping',
	description: 'Show the current ping of Nadeshiko.',

	run: async (client, interaction) => {
		const message = await interaction.fetchReply();

		interaction.editReply(`Latencia del bot: ${message.createdTimestamp - interaction.createdTimestamp}ms.\nLatencia API: ${Math.round(interaction.client.ws.ping)}ms.`);
	},
};