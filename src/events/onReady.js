const { db } = require("../db");

module.exports = {
  name: "ready",
  once: true,

  /**
   * @param {import('../typings').Client} client Main Application Client.
   * @description Executes when client is ready (bot initialization).
   */
  execute(client) {
    const CREATE_INITIAL_TABLE_QUERY = `
    create table if not exists message_stats
    (
        guid          integer             not null,
        uid           integer             not null,
        message_count integer   default 1 not null,
        voice_count   integer   default 0 not null,
        last_message_timestamp timestamp default current_timestamp not null,
        primary key (guid, uid)
    );
    `;

    db.prepare(CREATE_INITIAL_TABLE_QUERY).run();

    console.log(`Ready! Logged in as ${client.user.tag}`);
  },
};
