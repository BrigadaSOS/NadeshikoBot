module.exports = {
	name: 'restart',
	description: 'Restart Nadeshiko.',

	run: async (client, interaction) => {
        await interaction.deleteReply();
        process.exit();
	},
};