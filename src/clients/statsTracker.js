const { db } = require("../db");
const { findGuildMemberByUid } = require("../bot");

const ACTIVITY_ROLES_THRESHOLDS = {
  200: "795707709403562044",
  1000: "1040491096779792454",
  5000: "1040491093747322890",
  10000: "1040491090215706684",
  20000: "1040491048050364466",
  9999999999: "1040491239751041105",
};

console.log("INFO:: Activity roles thresholds", ACTIVITY_ROLES_THRESHOLDS);

/**
 * @param {import('discord.js').GuildMember } member The user whose role is to be updated.
 * @param {import('discord.js').Channel } channel The channel where to send the updated message
 * @param message_count The message count of the user.
 * @param silent If we should send a message to the channel or not.
 */
const updateRoleIfRequired = (
  member,
  channel,
  message_count,
  silent = false,
) => {
  try {
    for (const [threshold, role_id] of Object.entries(
      ACTIVITY_ROLES_THRESHOLDS,
    )) {
      if (message_count < parseInt(threshold, 10)) {
        if (
          member.user &&
          !member.user.bot &&
          member.roles &&
          !member.roles.cache.has(role_id)
        ) {
          console.log(`Adding role ${role_id} to ${member.id}...`);
          member.roles.remove(Object.values(ACTIVITY_ROLES_THRESHOLDS));
          member.roles.add(role_id);

          const role_name = member.guild.roles.cache.get(role_id).name;

          if (channel) {
            channel.send(
              `¡${
                silent ? `${member.user.username}` : `<@${member.user.id}>`
              } ha llegado al rango de **${role_name}**!`,
            );
          }
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
  updateRoleIfRequired(message.member, message.channel, message_count);
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
  updateRoleIfRequired(message.member, message.channel, message_count);
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

const replaceAllUserStats = async (guild, channel, input_json) => {
  const { findGuildMemberByUid } = require("../bot");

  for (const [key, value] of Object.entries(input_json)) {
    const uid = key;
    const message_count = value.count;
    console.log(`[${uid}] Processing ${value.nickname}...`);

    db.prepare(
      "insert into message_stats (guid, uid, message_count) values (?, ?, ?) ON CONFLICT (guid, uid) do update set message_count = ?",
    ).run(guild.id, uid, message_count, message_count);

    // eslint-disable-next-line no-await-in-loop
    const member = await findGuildMemberByUid(guild, uid);
    if (member) {
      updateRoleIfRequired(member, channel, message_count, true);
    }

    console.log(
      `[${uid}] Updated successfully. New message count ${message_count}`,
    );
  }
};

const getMembersRanking = async (member, top = 15, adjacent = 2) => {
  const { findGuildMemberByUid } = require("../bot");

  let memberRanking = {};
  const fullRanking = [];
  const adjacentRanking = [];

  let addedMembers = 0;
  const rows = db
    .prepare(
      `
      WITH RankedMessages AS (SELECT guid,
                                     uid,
                                     message_count,
                                     ROW_NUMBER() OVER (ORDER BY message_count DESC) AS rank
                              FROM message_stats
                              WHERE guid = ?)
      SELECT cast(guid as text) as guid, cast(uid as text) as uid, message_count, rank
      FROM RankedMessages
      ORDER BY message_count DESC;
    `,
    )
    .all(member.guild.id);

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    if (addedMembers < top) {
      // eslint-disable-next-line no-await-in-loop
      const rowMember = await findGuildMemberByUid(member.guild, row.uid);

      fullRanking.push({
        uid: row.uid,
        username: rowMember ? rowMember.user.username : "????",
        message_count: row.message_count,
        rank: row.rank,
      });
      addedMembers += 1;
    }

    if (row.uid === member.user.id) {
      for (
        let j = Math.max(row.rank - adjacent - 1, top);
        j < Math.min(row.rank + adjacent, rows.length);
        j += 1
      ) {
        // eslint-disable-next-line no-await-in-loop
        const adjacentMember = await findGuildMemberByUid(
          member.guild,
          rows[j].uid,
        );
        adjacentRanking.push({
          uid: rows[j].uid,
          username: adjacentMember ? adjacentMember.user.username : "????",
          message_count: rows[j].message_count,
          rank: rows[j].rank,
        });
      }
      memberRanking = {
        uid: member.user.id,
        username: member.user.username,
        message_count: row.message_count,
        rank: row.rank,
      };
    }
  }

  return {
    fullRanking,
    adjacentRanking,
    memberRanking,
  };
};

module.exports = {
  addMessage,
  removeMessage,
  fetchStats,
  replaceAllUserStats,
  getMembersRanking,
};
