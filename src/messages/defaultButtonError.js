module.exports = {
  /**
   * @param {import('discord.js').ButtonInteraction} interaction The Interaction Object of the command.
   * @description Executes when the button interaction could not be fetched.
   */

  async execute(interaction) {
    await interaction.reply({
      content: "There was an issue while fetching this button!",
      ephemeral: true,
    });
  },
};
