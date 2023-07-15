/**
 * @type {import('../../../typings').ContextInteractionCommand}
 */
module.exports = {
  data: {
    name: "sample",
    type: 3, // 3 is for message context menus
  },

  async execute(interaction) {
    await interaction.reply({
      content: "I am a sample message context menu.",
    });
  },
};
