const { db } = require("../db");

const ACTIVITY_ROLES_THRESHOLDS = {
  200: "795707709403562044",
  1000: "1040491096779792454",
  5000: "1040491093747322890",
  10000: "1040491090215706684",
  20000: "1040491048050364466",
  9999999999: "1040491239751041105",
};

// Override with other values if defined in the local config for testing
// if (fs.existsSync("./config.json")) {
//   // eslint-disable-next-line global-require
//   const config = require("../../config.json");
//   if (config.activity_roles_thresholds) {
//     ACTIVITY_ROLES_THRESHOLDS = config.activity_roles_thresholds;
//   }
// }

console.log("INFO:: Activity roles thresholds", ACTIVITY_ROLES_THRESHOLDS);

/**
 * @param {import('discord.js').GuildMember } member The user whose role is to be updated.
 * @param message_count The message count of the user.
 */
const updateRoleIfRequired = (message, message_count) => {
  const { member } = message;
  try {
    for (const [threshold, role_id] of Object.entries(
      ACTIVITY_ROLES_THRESHOLDS,
    )) {
      if (message_count < parseInt(threshold, 10)) {
        if (!member.roles.cache.has(role_id)) {
          console.log(`Adding role ${role_id} to ${member.id}...`);
          member.roles.remove(Object.values(ACTIVITY_ROLES_THRESHOLDS));
          member.roles.add(role_id);

          message.channel.send(
            `¡<@${member.user.id}> ha llegado al rango de <@&${role_id}>!`,
          );
          console.log(`Role added`);
        }
        return;
      }
    }
  } catch (err) {
    console.log(
      `Error updating role ${member.user.username} with count ${message_count}: ${err}`,
    );
  }
};

/**
 * @param {import('discord.js').Message } message The message which was created.
 */
const addMessage = (message) => {
  const row = db
    .prepare(
      "insert into message_stats (guid, uid, last_message_timestamp) values (?, ?, ?) ON CONFLICT (guid, uid) do update set message_count = message_count + 1, last_message_timestamp = ? returning message_count",
    )
    .get(
      message.guild.id,
      message.author.id,
      message.createdTimestamp,
      message.createdTimestamp,
    );

  const { message_count } = row;
  console.log(`Add: ${message.author.username} has ${message_count} messages`);
  updateRoleIfRequired(message, message_count);
};

/**
 * @param {import('discord.js').Message } message The message which was deleted.
 */
const removeMessage = (message) => {
  const row = db
    .prepare(
      "insert into message_stats (guid, uid, message_count) values (?, ?, 0) ON CONFLICT (guid, uid) do update set message_count = message_count - 1 returning message_count",
    )
    .get(message.guild.id, message.author.id);

  const { message_count } = row;
  console.log(
    `Remove: ${message.author.username} has ${message_count} messages`,
  );
  updateRoleIfRequired(message, message_count);
};

/**
 * @param {import('discord.js').GuildMember } member The user to check stats for.
 */
const fetchStats = (member) => {
  const row = db
    .prepare(
      "select message_count, last_message_timestamp from message_stats where guid = ? and uid = ?",
    )
    .get(member.guild.id, member.id);

  return {
    guid: member.guild.id,
    uid: member.id,
    message_count: row !== undefined ? row.message_count : 0,
    last_message_timestamp:
      row !== undefined ? row.last_message_timestamp : undefined,
  };
};

module.exports = {
  addMessage,
  removeMessage,
  fetchStats,
};
