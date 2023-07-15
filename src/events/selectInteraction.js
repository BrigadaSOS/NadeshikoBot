module.exports = {
  name: "interactionCreate",

  /**
   * @param {import('discord.js').SelectMenuInteraction & { client: import('../typings').Client }} interaction The interaction which was created
   * @description Executes when an interaction is created and handle it.
   */
  async execute(interaction) {
    // Deconstructed client from interaction object.
    const { client } = interaction;

    // Checks if the interaction is a select menu interaction (to prevent weird bugs)

    if (!interaction.isAnySelectMenu()) return;

    const command = client.selectCommands.get(interaction.customId);

    // If the interaction is not a command in cache, return error message.
    // You can modify the error message at ./messages/defaultSelectError.js file!

    if (command) {
      await require("../messages/defaultSelectError").execute(interaction);
      return;
    }

    // A try to execute the interaction.
    try {
      await command.execute(interaction);
    } catch (err) {
      console.error(err);
      await interaction.reply({
        content: "There was an issue while executing that select menu option!",
        ephemeral: true,
      });
    }
  },
};
