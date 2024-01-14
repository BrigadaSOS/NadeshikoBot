const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const cheerio = require("cheerio");
const Anilist = require("anilist-node");
const statsTracker = require("../../../clients/statsTracker");
const { db } = require("../../../db");

const anilistClient = new Anilist();

const fetchAnilistData = async (anilist_url) => {
  const split_url = anilist_url.split("/");
  const username = split_url[split_url.length - 1].trim();
  let completedAnimeCount = null;
  try {
    await anilistClient.user.all(username).then((data) => {
      completedAnimeCount = data.statistics.anime.count;
      console.log(data);
      console.log(`Found ${completedAnimeCount} completed animes!`);
    });
  } catch (err) {
    console.error("Error trying to fetch Anilist API. Skipping...", err);
  }

  return completedAnimeCount;
};

const fetchMyAnimeListData = async (myanimelist_url) => {
  let completedAnimeCount = null;
  try {
    const response = await fetch(myanimelist_url);

    const html = await response.text();
    const $ = cheerio.load(html);

    completedAnimeCount = Number(
      $(".stats-status")
        .first()
        .find(".completed")
        .parent()
        .find("span")
        .text()
        .trim(),
    );
    console.log(`Found ${completedAnimeCount} completed animes!`);
  } catch (err) {
    console.error("Error trying to parse MyAnimeList page. Skipping...", err);
  }

  return completedAnimeCount;
};

const fetchBookmeterData = async (bookmeter_url) => {
  let completedBookCount = null;
  try {
    const response = await fetch(bookmeter_url);
    const html = await response.text();
    const $ = cheerio.load(html);
    completedBookCount = $(".userdata-nav")
      .first()
      .find("li")
      .first()
      .find(".userdata-nav__count")
      .clone()
      .children()
      .remove()
      .end()
      .text()
      .trim();

    console.log(`Found ${completedBookCount} completed books!`);
  } catch (err) {
    console.error("Error trying to parse Bookmeter page. Skipping...", err);
  }

  return completedBookCount;
};

const fetchVndbData = async (vndb_url) => {
  let completedVnCount = null;
  try {
    const response = await fetch(vndb_url);
    const html = await response.text();
    const $ = cheerio.load(html);
    completedVnCount = $(".ulist")
      .first()
      .find(`td:contains("Finished")`).length;

    console.log(`Found ${completedVnCount} completed VNs!`);
  } catch (err) {
    console.error("Error trying to parse vndb page. Skipping...", err);
  }

  return completedVnCount;
};

const syncProfileDataFromExternalLinks = async (interaction) => {
  const guid = interaction.guild.id;
  const uid = interaction.user.id;

  const row = db
    .prepare("select * from profiles where guid = ? and uid = ?")
    .get(guid, uid);

  if (
    !row.anilist_user &&
    !row.myanimelist_user &&
    !row.bookmeter_user &&
    !row.vndb_user
  ) {
    await interaction.editReply(
      "No hay ningún perfil externo configurado. Primero enlace un perfil con el comando /actualizar <perfil>",
    );
  }

  let atLeastOneSuccessfulUpdate = false;
  let outputMessage = "### Perfil actualizado!\n";

  let anilistUpdatedCount = null;
  if (row.anilist_user) {
    anilistUpdatedCount = await fetchAnilistData(row.anilist_user);
    if (anilistUpdatedCount) {
      outputMessage += `**[Anilist]** Anime completado: ~~${row.anilist_completed_count}~~ -> **${anilistUpdatedCount}**\n`;
      atLeastOneSuccessfulUpdate = true;
    }
  }

  let myanimelistUpdatedCount = null;
  if (row.myanimelist_user) {
    myanimelistUpdatedCount = await fetchMyAnimeListData(row.myanimelist_user);

    if (myanimelistUpdatedCount) {
      outputMessage += `**[MyAnimeList]** Anime completado: ~~${row.myanimelist_completed_count}~~ -> **${myanimelistUpdatedCount}**\n`;
      atLeastOneSuccessfulUpdate = true;
    }
  }

  let bookmeterUpdatedCount = null;
  if (row.bookmeter_user) {
    bookmeterUpdatedCount = await fetchBookmeterData(row.bookmeter_user);

    if (bookmeterUpdatedCount) {
      outputMessage += `**[Bookmeter]** Libros completados: ~~${row.bookmeter_completed_count}~~ -> **${bookmeterUpdatedCount}**\n`;
      atLeastOneSuccessfulUpdate = true;
    }
  }

  let vndbUpdatedCount = null;
  if (row.vndb_user) {
    vndbUpdatedCount = await fetchVndbData(row.vndb_user);

    if (vndbUpdatedCount) {
      outputMessage += `**[vndb]** VNs completadas: ~~${row.vndb_completed_count}~~ -> **${vndbUpdatedCount}**\n`;
      atLeastOneSuccessfulUpdate = true;
    }
  }

  if (atLeastOneSuccessfulUpdate) {
    await interaction.editReply(outputMessage);
  } else {
    await interaction.editReply(
      "No se ha podido sincronizar el perfil con las páginas externas. Inténtelo más tarde.",
    );
  }
};

const updateAnilistLink = async (interaction) => {
  const guid = interaction.guild.id;
  const uid = interaction.user.id;
  const user_to_link = interaction.options.getString("usuario");

  if (!user_to_link) {
    console.log(`[${guid}-${uid}] Removing Anilist link...`);
    db.prepare(
      "insert into profiles (guid, uid, anilist_user, anilist_completed_count) values (?, ?, NULL, NULL) ON CONFLICT (guid, uid) do update set anilist_user = NULL, anilist_completed_count = NULL",
    ).run(guid, uid);
    console.log("Finished removing!");
    await interaction.editReply(
      "Se ha eliminado el enlace a Anilist del perfil",
    );
    return;
  }

  console.log(`[${guid}-${uid}] Adding Anilist user: ${user_to_link}`);

  let anilist_url;
  if (!!user_to_link && user_to_link.includes("anilist.co")) {
    anilist_url = user_to_link;
  } else {
    anilist_url = `https://anilist.co/user/${user_to_link}`;
  }

  const completedAnimeCount = await fetchAnilistData(anilist_url);

  db.prepare(
    "insert into profiles (guid, uid, anilist_user, anilist_completed_count) values (?, ?, ?, ?) ON CONFLICT (guid, uid) do update set anilist_user = ?, anilist_completed_count = ?",
  ).run(
    guid,
    uid,
    anilist_url,
    completedAnimeCount,
    anilist_url,
    completedAnimeCount,
  );

  console.log(
    `[${guid}-${uid}] User ${anilist_url} added. Found ${completedAnimeCount} completed animes.`,
  );

  await interaction.editReply(
    `### Perfil de Anilist encontrado!\nAñadiendo enlace al perfil: ${anilist_url}\n\n${
      completedAnimeCount ? `Anime completado: ${completedAnimeCount}` : ""
    }`,
  );
};

const updateMyAnimelistLink = async (interaction) => {
  const guid = interaction.guild.id;
  const uid = interaction.user.id;
  const user_to_link = interaction.options.getString("usuario");

  if (!user_to_link) {
    console.log(`[${guid}-${uid}] Removing MyAnimeList link...`);
    db.prepare(
      "insert into profiles (guid, uid, myanimelist_user, myanimelist_completed_count) values (?, ?, NULL, NULL) ON CONFLICT (guid, uid) do update set myanimelist_user = NULL, myanimelist_completed_count = NULL",
    ).run(guid, uid);
    console.log("Finished removing!");
    await interaction.editReply(
      "Se ha eliminado el enlace a MyAnimeList del perfil",
    );
    return;
  }

  console.log(`[${guid}-${uid}] Adding MyAnimeList user: ${user_to_link}`);

  let myanimelist_url;
  if (!!user_to_link && user_to_link.includes("myanimelist.net")) {
    myanimelist_url = user_to_link;
  } else {
    myanimelist_url = `https://myanimelist.net/profile/${user_to_link}`;
  }

  const completedAnimeCount = await fetchMyAnimeListData(myanimelist_url);

  db.prepare(
    "insert into profiles (guid, uid, myanimelist_user, myanimelist_completed_count) values (?, ?, ?, ?) ON CONFLICT (guid, uid) do update set myanimelist_user = ?, myanimelist_completed_count = ?",
  ).run(
    guid,
    uid,
    myanimelist_url,
    completedAnimeCount,
    myanimelist_url,
    completedAnimeCount,
  );

  console.log(
    `[${guid}-${uid}] User ${myanimelist_url} added. Found ${completedAnimeCount} completed animes.`,
  );

  await interaction.editReply(
    `### Perfil de MyAnimeList encontrado!\nAñadiendo enlace al perfil: ${myanimelist_url}\n\n${
      completedAnimeCount
        ? `Animes completados: **${completedAnimeCount}**`
        : ""
    }`,
  );
};

const updateBookmeterLink = async (interaction) => {
  const guid = interaction.guild.id;
  const uid = interaction.user.id;
  const user_to_link = interaction.options.getString("usuario");

  if (!user_to_link) {
    console.log(`[${guid}-${uid}] Removing Bookmeter link...`);
    db.prepare(
      "insert into profiles (guid, uid, bookmeter_user, bookmeter_completed_count) values (?, ?, NULL, NULL) ON CONFLICT (guid, uid) do update set bookmeter_user = NULL, bookmeter_completed_count = NULL",
    ).run(guid, uid);
    console.log("Finished removing!");
    await interaction.editReply(
      "Se ha eliminado el enlace a Bookmeter del perfil",
    );
    return;
  }

  console.log(`[${guid}-${uid}] Adding Bookmeter user: ${user_to_link}`);

  let bookmeter_url;
  if (!!user_to_link && user_to_link.includes("bookmeter.com")) {
    bookmeter_url = user_to_link;
  } else {
    bookmeter_url = `https://bookmeter.com/users/${user_to_link}`;
  }

  const completedBookCount = await fetchBookmeterData(bookmeter_url);

  db.prepare(
    "insert into profiles (guid, uid, bookmeter_user, bookmeter_completed_count) values (?, ?, ?, ?) ON CONFLICT (guid, uid) do update set bookmeter_user = ?, bookmeter_completed_count = ?",
  ).run(
    guid,
    uid,
    bookmeter_url,
    completedBookCount,
    bookmeter_url,
    completedBookCount,
  );

  console.log(
    `[${guid}-${uid}] User ${bookmeter_url} added. Found ${completedBookCount} completed books.`,
  );

  await interaction.editReply(
    `### Perfil de Bookmeter encontrado!\nAñadiendo enlace al perfil: ${bookmeter_url}\n\n${
      completedBookCount ? `Libros completados: **${completedBookCount}**` : ""
    }`,
  );
};

const updateVndbLink = async (interaction) => {
  const guid = interaction.guild.id;
  const uid = interaction.user.id;
  const user_to_link = interaction.options.getString("usuario");

  if (!user_to_link) {
    console.log(`[${guid}-${uid}] Removing Vndb link...`);
    db.prepare(
      "insert into profiles (guid, uid, vndb_user, vndb_completed_count) values (?, ?, NULL, NULL) ON CONFLICT (guid, uid) do update set vndb_user = NULL, vndb_completed_count = NULL",
    ).run(guid, uid);
    console.log("Finished removing!");
    await interaction.editReply("Se ha eliminado el enlace a vndb del perfil");
    return;
  }

  console.log(`[${guid}-${uid}] Adding vndb user: ${user_to_link}`);

  let vndb_url;
  if (!!user_to_link && user_to_link.includes("vndb.org")) {
    await interaction.editReply(
      "Introduzca solo el ID de usuario <u1234567> en lugar de la URL completa",
    );
    return;
  } else {
    vndb_url = `https://vndb.org/${user_to_link}/ulist?f=&mul=1&s=3q4g`;
  }

  const completedVnCount = await fetchVndbData(vndb_url);

  db.prepare(
    "insert into profiles (guid, uid, vndb_user, vndb_completed_count) values (?, ?, ?, ?) ON CONFLICT (guid, uid) do update set vndb_user = ?, vndb_completed_count = ?",
  ).run(guid, uid, vndb_url, completedVnCount, vndb_url, completedVnCount);

  console.log(
    `[${guid}-${uid}] User ${vndb_url} added. Found ${completedVnCount} completed books.`,
  );

  await interaction.editReply(
    `### Perfil de vndb encontrado!\nAñadiendo enlace al perfil: ${vndb_url}\n\n${
      completedVnCount ? `VNs completadas: **${completedVnCount}**` : ""
    }`,
  );
};

const showUserProfile = async (interaction) => {
  let { member } = interaction;

  console.log(`[${member.guild.id}-${member.id}] Fetching profile...`);

  const user = interaction.options.getUser("usuario");
  if (user !== undefined && user !== null) {
    member = interaction.guild.members.cache.get(user.id);
  }

  const userStats = statsTracker.fetchStats(member);

  let profileStats = {};

  try {
    profileStats = db
      .prepare("select * from profiles where guid = ? and uid = ?")
      .get(member.guild.id, member.id);
  } catch (err) {
    console.log(`No profile row found for user ${user.id}`);
  }

  const fields = [
    {
      name: "Miembro desde",
      value: `<t:${Math.floor(
        member.joinedTimestamp / 1000,
      )}:D> - <t:${Math.floor(member.joinedTimestamp / 1000)}:R>`,
      inline: false,
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

  const isAnilistAndMyanimelistDefined =
    profileStats.anilist_completed_count &&
    profileStats.myanimelist_completed_count;

  const statsFields = [];

  let profiles = "";
  if (profileStats.anilist_user) {
    profiles += `* **[Anilist]**: ${profileStats.anilist_user}\n`;
    if (profileStats.anilist_completed_count) {
      statsFields.push({
        name: `${
          isAnilistAndMyanimelistDefined ? "[Anilist] " : ""
        }Animes completados`,
        value: profileStats.anilist_completed_count.toString(),
        inline: true,
      });
    }
  }
  if (profileStats.myanimelist_user) {
    profiles += `* **[MyAnimeList]**: ${profileStats.myanimelist_user}\n`;
    if (profileStats.myanimelist_completed_count) {
      statsFields.push({
        name: `${
          isAnilistAndMyanimelistDefined ? "[MyAnimeList] " : ""
        }Animes completados`,
        value: profileStats.myanimelist_completed_count.toString(),
        inline: true,
      });
    }
  }
  if (profileStats.bookmeter_user) {
    profiles += `* **[Bookmeter]** ${profileStats.bookmeter_user}\n`;
    if (profileStats.bookmeter_completed_count) {
      statsFields.push({
        name: "Libros leídos",
        value: profileStats.bookmeter_completed_count.toString(),
        inline: true,
      });
    }
  }
  if (profileStats.vndb_user) {
    profiles += `* **[vndb]** ${profileStats.vndb_user}\n`;
    if (profileStats.vndb_completed_count) {
      statsFields.push({
        name: "VNs leídas",
        value: profileStats.vndb_completed_count.toString(),
        inline: true,
      });
    }
  }

  if (profiles !== "") {
    fields.push({
      name: "Perfiles",
      value: profiles,
      inline: false,
    });
  }

  if (statsFields.length > 0) {
    fields.push(...statsFields);
  }

  const embed = new EmbedBuilder()
    .setTitle(`Información de ${member.user.username} en ${member.guild.name}`)
    .setFields(...fields)
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
    .setFooter({ text: `ID: ${member.id}` });

  await interaction.editReply({ embeds: [embed] });
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("perfil")
    .setDMPermission(false)
    .setDescription("Obtén información de los perfiles del servidor.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("info")
        .setDescription("Información del perfil de un usuario.")
        .addUserOption((option) =>
          option
            .setName("usuario")
            .setDescription("Nombre de usuario a buscar")
            .setRequired(false),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("sincronizar")
        .setDescription(
          "Sincroniza los datos de perfiles externos configurados con el perfil del servidor",
        ),
    )
    .addSubcommandGroup((subcommandGroup) =>
      subcommandGroup
        .setName("actualizar")
        .setDescription("Actualiza la información del perfil de servidor.")
        .addSubcommand((subcommand) =>
          subcommand
            .setName("anilist")
            .setDescription("Añade un enlace a tu perfil de Anilist")
            .addStringOption((option) =>
              option
                .setName("usuario")
                .setDescription(
                  "Nombre de usuario de Anilist. Déjalo vacío para eliminar el enlace.",
                )
                .setRequired(false),
            ),
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("myanimelist")
            .setDescription("Añade un enlace a tu perfil de MyAnimeList")
            .addStringOption((option) =>
              option
                .setName("usuario")
                .setDescription(
                  "Nombre de usuario de MyAnimeList. Déjalo vacío para eliminar el enlace.",
                )
                .setRequired(false),
            ),
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("vndb")
            .setDescription("Añade un enlace a tu perfil de VNDB")
            .addStringOption((option) =>
              option
                .setName("usuario")
                .setDescription(
                  "ID de usuario de VNDB. Déjalo vacío para eliminar el enlace.",
                )
                .setRequired(false),
            ),
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName("bookmeter")
            .setDescription("Añade un enlace a tu perfil de Bookmeter")
            .addStringOption((option) =>
              option
                .setName("usuario")
                .setDescription("ID de usuario de Bookmeter")
                .setRequired(false),
            ),
        ),
    ),
  async execute(interaction) {
    await interaction.deferReply();

    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case "anilist":
        await updateAnilistLink(interaction);
        break;
      case "myanimelist":
        await updateMyAnimelistLink(interaction);
        break;
      case "bookmeter":
        await updateBookmeterLink(interaction);
        break;
      case "vndb":
        await updateVndbLink(interaction);
        break;
      case "sincronizar":
        await syncProfileDataFromExternalLinks(interaction);
        break;
      case "info":
        showUserProfile(interaction);
        break;
      default:
        showUserProfile(interaction);
        break;
    }
  },
};
