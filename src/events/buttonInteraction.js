const { Events } = require("discord.js");

module.exports = {
  name: Events.InteractionCreate,

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
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (err) {
      console.error(err);
      await require("../messages/defaultError").execute(interaction);
    }
  },
};
