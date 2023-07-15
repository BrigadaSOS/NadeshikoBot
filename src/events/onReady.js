module.exports = {
  name: "ready",
  once: true,

  /**
   * @param {import('../typings').Client} client Main Application Client.
   * @description Executes when client is ready (bot initialization).
   */
  execute(client) {
    console.log(`Ready! Logged in as ${client.user.tag}`);
  },
};
