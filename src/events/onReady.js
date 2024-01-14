const { db } = require("../db");

module.exports = {
  name: "ready",
  once: true,

  /**
   * @param {import('../typings').Client} client Main Application Client.
   * @description Executes when client is ready (bot initialization).
   */
  execute(client) {
    const CREATE_MESSAGES_TABLE = `
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
    db.prepare(CREATE_MESSAGES_TABLE).run();

    const CREATE_PROFILES_TABLE = `
    create table if not exists profiles
    (
      guid             integer not null,
      uid              integer not null,
      anilist_user     text,
      anilist_completed_count integer,
      myanimelist_user text,
      myanimelist_completed_count integer,
      vndb_user        text,
      vndb_completed_count integer,
      bookmeter_user   text,
      bookmeter_completed_count integer,
      primary key (guid, uid)
    );
    `;
    db.prepare(CREATE_PROFILES_TABLE).run();

    console.log(`Ready! Logged in as ${client.user.tag}`);
  },
};
