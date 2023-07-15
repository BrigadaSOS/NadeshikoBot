module.exports = {
  name: "interactionCreate",

  /**
   * @param {import('discord.js').ButtonInteraction & { client: import('../typings').Client }} interaction The interaction which was created
   * @description Executes when an interaction is created and handle it.
   */
  async execute(interaction) {
    // Deconstructed client from interaction object.
    const { client } = interaction;

    // Checks if the interaction is a button interaction (to prevent weird bugs)

    if (!interaction.isButton()) return;

    const command = client.buttonCommands.get(interaction.customId);

    // If the interaction is not a command in cache, return error message.
    // You can modify the error message at ./messages/defaultButtonError.js file!

    if (!command) {
      await require("../messages/defaultButtonError").execute(interaction);
      return;
    }

    // A try to execute the interaction.

    try {
      await command.execute(interaction);
    } catch (err) {
      console.error(err);
      await interaction.reply({
        content: "There was an issue while executing that button!",
        ephemeral: true,
      });
    }
  },
};
