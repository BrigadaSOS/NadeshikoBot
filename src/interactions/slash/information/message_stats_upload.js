const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const statsTracker = require("../../../clients/statsTracker");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("message_stats_upload")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDescription("Update the user message count stats from exported file")
    .addAttachmentOption((option) =>
      option
        .setName("message_count_file")
        .setDescription("Archivo *.json a subir")
        .setRequired(true),
    ),
  async execute(interaction) {
    await interaction.deferReply();

    const input_attachment =
      interaction.options.getAttachment("message_count_file");
    console.log(input_attachment);

    const json_data = await fetch(input_attachment.url).then((res) =>
      res.json(),
    ); // Gets the response and returns it as a blob
    console.log("Uploaded JSON:", json_data);

    statsTracker.replaceAllUserStats(interaction.guild.id, json_data);

    await interaction.editReply("Successfully updated data for all users!!");
  },
};
