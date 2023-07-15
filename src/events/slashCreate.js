module.exports = {
  name: "interactionCreate",

  /**
   * @param {import('discord.js').CommandInteraction & { client: import('../typings').Client }} interaction The interaction which was created
   * @description Executes when an interaction is created and handle it.
   */
  async execute(interaction) {
    // Deconstructed client from interaction object.
    const { client } = interaction;

    // Checks if the interaction is a command (to prevent weird bugs)

    if (!interaction.isChatInputCommand()) return;

    const command = client.slashCommands.get(interaction.commandName);

    // If the interaction is not a command in cache.

    if (!command) return;

    // A try to executes the interaction.

    try {
      await command.execute(interaction);
    } catch (err) {
      console.error(err);
      await interaction.reply({
        content: "There was an issue while executing that command!",
        ephemeral: true,
      });
    }
  },
};
