const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const statsTracker = require("../../../clients/statsTracker");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("perfil")
    .setDMPermission(false)
    .setDescription("Obtén información de un perfil de usuario.")
    .addUserOption((option) =>
      option
        .setName("usuario")
        .setDescription("Nombre de usuario a buscar")
        .setRequired(false),
    ),
  async execute(interaction) {
    await interaction.deferReply();

    let { member } = interaction;
    const user = interaction.options.getUser("usuario");
    if (user !== undefined && user !== null) {
      member = interaction.guild.members.cache.get(user.id);
    }

    const userStats = statsTracker.fetchStats(member);

    const fields = [
      {
        name: "Miembro desde",
        value: `<t:${Math.floor(
          member.joinedTimestamp / 1000,
        )}:D> - <t:${Math.floor(member.joinedTimestamp / 1000)}:R>`,
      },
    ];

    if (member.roles !== undefined) {
      fields.push({
        name: "Roles",
        value: member.roles.cache.map((role) => role.toString()).join(", "),
      });
    }

    fields.push({
      name: "Mensajes enviados",
      value: userStats.message_count.toString(),
      inline: true,
    });

    if (userStats.last_message_timestamp !== undefined) {
      fields.push({
        name: "Último mensaje",
        value: `<t:${Math.floor(userStats.last_message_timestamp / 1000)}:R>`,
        inline: true,
      });
    }

    const embed = new EmbedBuilder()
      .setTitle(
        `Información de ${member.user.username} en ${member.guild.name}`,
      )
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setFields(...fields)
      .setFooter({ text: `ID: ${member.id}` });

    await interaction.editReply({ embeds: [embed] });
  },
};
