const { Events } = require("discord.js");

module.exports = {
  name: Events.InteractionCreate,

  /**
   * @param {import('discord.js').CommandInteraction & { client: import('../typings').Client }} interaction The interaction which was created
   * @description Executes when an interaction is created and handle it.
   */
  async execute(interaction) {
    const { client } = interaction;

    // Checks if the interaction is a command (to prevent weird bugs)
    if (!interaction.isChatInputCommand()) return;

    // Try to find a slash command defined for it.
    const command = client.slashCommands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (err) {
      console.error(err);
      await require("../messages/defaultError").execute(interaction);
    }
  },
};
