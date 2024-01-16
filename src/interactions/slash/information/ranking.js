const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

const statsTracker = require("../../../clients/statsTracker");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rank")
    .setDescription("Muestra el ranking de actividad del servidor")
    .addUserOption((option) =>
      option
        .setName("usuario")
        .setDescription("Usuario a buscar")
        .setRequired(false),
    ),
  async execute(interaction) {
    await interaction.deferReply();

    let { member } = interaction;
    const user = interaction.options.getUser("usuario");
    if (user !== undefined && user !== null) {
      member = interaction.guild.members.cache.get(user.id);
    }

    const result = await statsTracker.getMembersRanking(member);

    console.log("Result", result);

    let searchedUsedInTopRanking = false;

    let bodyMessage = `### Ranking de actividad en ${interaction.guild.name}:\n\n`;

    result.fullRanking.forEach((row) => {
      if (row.uid === member.user.id) {
        searchedUsedInTopRanking = true;
        bodyMessage += `* **${row.rank}. @${row.username} - ${row.message_count} mensajes**\n`;
      } else {
        bodyMessage += `* **${row.rank}.** @${row.username} - ${row.message_count} mensajes\n`;
      }
    });

    if (!searchedUsedInTopRanking) {
      bodyMessage += `...\n`;
      result.adjacentRanking.forEach((row) => {
        if (row.uid === member.user.id) {
          bodyMessage += `* **${row.rank}. @${row.username} - ${row.message_count} mensajes**\n`;
        } else {
          bodyMessage += `* **${row.rank}.** @${row.username} - ${row.message_count} mensajes\n`;
        }
      });
    }

    bodyMessage += `\n<@${member.user.id}> está en el **puesto número ${result.memberRanking.rank}** con **${result.memberRanking.message_count} mensajes.**`;

    await interaction.editReply(bodyMessage);
  },
};
