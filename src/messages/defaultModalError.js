module.exports = {
  /**
   * @param {import('discord.js').ModalSubmitInteraction} interaction The Interaction Object of the command.
   * @description Executes when the modal interaction could not be fetched.
   */

  async execute(interaction) {
    await interaction.reply({
      content: "There was an issue while fetching this modal!",
      ephemeral: true,
    });
  },
};
