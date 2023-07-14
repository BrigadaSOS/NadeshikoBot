const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("avatar")
		.setDescription("Muestra el avatar de un miembro o el tuyo.")
		.addUserOption((option) =>
			option
				.setName("usuario")
				.setDescription("Escribe el nombre de un miembro del servidor")
		),
	async execute(interaction) {
		let user = null;
		const embed = new EmbedBuilder().setColor("eb868f");

		try {
			user = interaction.options.get("usuario").value;
		} catch (error) {
			console.log(error);
		}
        
		if (user === null) {
			embed.setImage(
				interaction.user.displayAvatarURL({ dynamic: true, size: 1024 })
			);
			interaction.reply({ embeds: [embed] });
		} else {
			const memberMention = user.toString();
			const id = memberMention.replace(/\D/g, "");
			const objectUser = await interaction.client.users.fetch(id);
			embed
				.setImage(objectUser.displayAvatarURL({ dynamic: true, size: 1024 }))
				.setTitle(`Avatar de ${objectUser.username}`);
			interaction.reply({ embeds: [embed] });
		}
	},
};
