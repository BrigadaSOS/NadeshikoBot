module.exports = {
  name: "interactionCreate",

  /**
   * @param {import('discord.js').AutocompleteInteraction & { client: import('../typings').Client }} interaction The interaction which was created
   * @description Executes when an interaction is created and handle it.
   */
  async execute(interaction) {
    // Deconstructed client from interaction object.
    const { client } = interaction;

    // Checks if the interaction is an autocomplete interaction (to prevent weird bugs)

    if (!interaction.isAutocomplete()) return;

    // Checks if the request is available in our code.

    const request = client.autocompleteInteractions.get(
      interaction.commandName,
    );

    // If the interaction is not a request in cache return.

    if (!request) return;

    // A try to execute the interaction.

    try {
      await request.execute(interaction);
    } catch (err) {
      console.error(err);
    }
  },
};
