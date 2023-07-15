const { PREFIX } = require("../bot-config.js");

module.exports = {
  /**
   * @param {import('discord.js').Message} message The Message Object of the command.
   * @description Executes when the bot is pinged.
   */

  async execute(message) {
    return message.channel.send(
      `Hi ${message.author}! My prefix is \`${PREFIX}\`, get help by \`${PREFIX}help\``,
    );
  },
};
