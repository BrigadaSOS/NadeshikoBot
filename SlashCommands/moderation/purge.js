module.exports = {
	name: 'purge',
	description: 'Purge up to 99 messages.',
	permissions: 'MANAGE_MESSAGES',
	options: [{
		name: 'number',
		description: 'Enter an integer',
		type: 'INTEGER',
		required: true,
	}],
	run: async (client, interaction, args) => {
		const amount = parseInt(args[0]) + 1;

		if (isNaN(amount)) {
			return interaction.editReply('Número no valido.');
		}
		else if (amount <= 1 || amount > 100) {
			return interaction.editReply('Rango 1 - 99.');
		}
		const message = await interaction.fetchReply();
		message.channel.bulkDelete(amount, true).catch((err) => {
			console.error(err);
			message.channel.send('Hubo un error.');
		});
	},
};
