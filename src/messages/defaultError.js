module.exports = {
  /**
   * @param {import('discord.js').MessageComponentInteraction} interaction The Interaction Object of the command.
   * @description Executes when the button interaction could not be fetched.
   */
  async execute(interaction) {
    const content = "*Ha ocurrido un error. Inténtelo más tarde.*";

    if (interaction.deferred) {
      await interaction.followUp({
        content,
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content,
        ephemeral: true,
      });
    }
  },
};
