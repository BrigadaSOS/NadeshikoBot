/* eslint-disable consistent-return */

const statsTracker = require("../clients/statsTracker");
const { TESTER_ROLE } = require("../bot-config");

module.exports = {
  name: "messageCreate",

  /**
   * @param {import('discord.js').Message & { client: import('../typings').Client }} message The message which was created.
   * @description Executes when a message is created and handle it.
   */
  async execute(message) {
    const { client, guild, channel, content, author } = message;

    if (message.member.roles && message.member.roles.cache.has(TESTER_ROLE)) {
      statsTracker.addMessage(message);
    }

    // Checks if the bot is mentioned in the message all alone and triggers onMention trigger.
    // You can change the behavior as per your liking at ./messages/onMention.js

    if (
      message.content === `<@${client.user.id}>` ||
      message.content === `<@!${client.user.id}>`
    ) {
      require("../messages/onMention").execute(message);
    }
  },
};
