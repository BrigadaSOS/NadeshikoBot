module.exports = {
	name: 'purge',
	description: 'Purge up to 99 messages.',
	permissions: 'MANAGE_MESSAGES',
	options: [{
		name: 'number',
		description: 'Enter an integer',
		type: 'INTEGER',
		required: true,
	},
	{
		name: 'user',
		description: 'Tag any user!',
		type: 'MENTIONABLE',
		required: false,
	},
	],
	run: async (client, interaction, args) => {
		const amount = parseInt(args[0]) + 1;

		if(args[1] != null) {
			member = interaction.options.get('user').value;
			id_user = member.replace(/\D/g, '');
			try {
				userObject = await client.users.fetch(id_user);
			} catch (error) {
				return interaction.editReply('El valor ingresado no es un usuario.');
			}
			const message = await interaction.fetchReply();
			const messages = message.channel.messages.fetch();

			const userMessages = (await messages).filter((m) => m.author.id === userObject.id);
			await message.channel.bulkDelete(userMessages);
			
		}else{
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
		}
	},
};
