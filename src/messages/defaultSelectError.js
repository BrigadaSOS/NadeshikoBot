module.exports = {
  /**
   * @param {import('discord.js').SelectMenuInteraction} interaction The Interaction Object of the command.
   * @description Executes when the select menu interaction could not be fetched.
   */

  async execute(interaction) {
    await interaction.reply({
      content: "There was an issue while fetching this select menu option!",
      ephemeral: true,
    });
  },
};
