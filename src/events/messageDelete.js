/* eslint-disable consistent-return */

const statsTracker = require("../clients/statsTracker");
const { TESTER_ROLE } = require("../bot-config");

module.exports = {
  name: "messageDelete",

  /**
   * @param {import('discord.js').Message & { client: import('../typings').Client }} message The message which was created.
   * @description Executes when a message is created and handle it.
   */
  async execute(message) {
    if (message.member.roles.cache.has(TESTER_ROLE)) {
      statsTracker.removeMessage(message);
    }
  },
};
