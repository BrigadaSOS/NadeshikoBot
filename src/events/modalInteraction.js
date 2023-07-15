module.exports = {
  name: "interactionCreate",

  /**
   * @param {import('discord.js').Interaction & { client: import('../typings').Client }} interaction The interaction which was created
   * @description Executes when an interaction is created and handle it.
   */
  async execute(interaction) {
    // Deconstructed client from interaction object.
    const { client } = interaction;

    // Checks if the interaction is a modal interaction (to prevent weird bugs)

    if (!interaction.isModalSubmit()) return;

    const command = client.modalCommands.get(interaction.customId);

    // If the interaction is not a command in cache, return error message.
    // You can modify the error message at ./messages/defaultModalError.js file!

    if (!command) {
      await require("../messages/defaultModalError").execute(interaction);
      return;
    }

    // A try to execute the interaction.

    try {
      await command.execute(interaction);
    } catch (err) {
      console.log(err);
      await interaction.reply({
        content: "There was an issue while understanding this modal!",
        ephemeral: true,
      });
    }
  },
};
