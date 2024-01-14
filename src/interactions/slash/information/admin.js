const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

const statsTracker = require("../../../clients/statsTracker");

/**
 * @param {import('discord.js').Interaction } interaction The interaction which was created.
 */
const messageStatsUploadSubcommand = async (interaction) => {
  const input_attachment =
    interaction.options.getAttachment("message_count_file");
  console.log(input_attachment);

  const json_data = await fetch(input_attachment.url).then((res) => res.json()); // Gets the response and returns it as a blob
  console.log("Uploaded JSON:", json_data);
  console.log(interaction);

  await statsTracker.replaceAllUserStats(
    interaction.guild,
    interaction.channel,
    json_data,
  );

  await interaction.editReply("Successfully updated data for all users!!");
};

const reloadCommands = async (interaction) => {
  const { updateSlashCommands } = require("../../../bot");

  const scope = interaction.options.getString("scope");
  const reset = interaction.options.getBoolean("reset");
  const result = await updateSlashCommands(scope, reset);

  if (result) {
    await interaction.editReply(
      `Successfully ${reset ? "reloaded" : "deleted"} ${scope} commands`,
    );
  } else {
    await interaction.editReply("There was an error. PLease try again later");
  }
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("admin")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDescription("Administrator commands for Nadeshiko")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("message_stats_upload")
        .setDescription(
          "Update the user message count stats from exported file",
        )
        .addAttachmentOption((option) =>
          option
            .setName("message_count_file")
            .setDescription("Archivo *.json a subir")
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("reload_commands")
        .setDescription("Reloads or resets all commands")
        .addStringOption((option) =>
          option
            .setName("scope")
            .setDescription("Scope of commands to reload")
            .setRequired(false)
            .addChoices(
              {
                name: "Global",
                value: "global",
              },
              {
                name: "Guild",
                value: "guild",
              },
            ),
        )
        .addBooleanOption((option) =>
          option
            .setName("reset")
            .setDescription("Reset and wipe all commands for the scope")
            .setRequired(false),
        ),
    ),
  async execute(interaction) {
    await interaction.deferReply();

    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case "message_stats_upload":
        messageStatsUploadSubcommand(interaction);
        break;
      case "reload_commands":
        reloadCommands(interaction);
        break;
      default:
        break;
    }
  },
};
