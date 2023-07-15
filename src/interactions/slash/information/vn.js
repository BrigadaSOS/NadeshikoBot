const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder,
  ComponentType,
  SlashCommandBuilder,
} = require("discord.js");
const axios = require("axios");

const durationNorm = {
  5: "Muy largo",
  4: "Largo",
  3: "Intermedio",
  2: "Corto",
  1: "Muy corto",
};

const langNorm = {
  de: ":flag_de: (Alemán)",
  es: ":flag_es: (Español)",
  fr: ":flag_fr: (Francés)",
  it: ":flag_it: (Italiano)",
  en: ":flag_gb: (Inglés)",
  ja: ":flag_jp: (Japonés)",
  "zh-Hans": ":flag_cn: (Chino Simplificado)",
  "zh-Hant": ":flag_cn: (Chino Tradicional)",
  ko: ":flag_kr: (Coreano)",
  "pt-br": ":flag_br: (Portugués)",
  ru: ":flag_ru: (Ruso)",
  vi: ":flag_vn: (Vietnamita)",
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("vndb")
    .setDescription("Busca información dentro de la base de datos de VNDB.")
    .addStringOption((option) =>
      option
        .setName("categoria")
        .setDescription("¿Qué tipo de contenido deseas buscar?")
        .setRequired(true)
        .addChoices(
          { name: "Novelas Visuales", value: "vn" },
          { name: "Personajes", value: "character" },
        ),
    )
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("Escribe el nombre a buscar.")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("idioma")
        .setDescription("¿En qué idioma quieres el resultado?")
        .setRequired(false)
        .addChoices(
          { name: "Español (por defecto)", value: "es" },
          { name: "Ingles", value: "en" },
        ),
    ),
  async execute(interaction) {
    const category = interaction.options.getString("categoria");
    const query = interaction.options.getString("query");
    const language = interaction.options.getString("idioma");

    if (category === "vn") {
      let response = await axios.post("https://api.vndb.org/kana/vn", {
        filters: ["search", "=", query],
        fields: "id, title",
      });

      const { results } = response.data;

      const showcaseTitles = [
        { label: "❌ | Cerrar Buscador", value: "close" },
      ];

      results.forEach((item) => {
        showcaseTitles.push({
          label: item.title,
          value: item.id,
        });
      });

      const row = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("select_item_vn")
          .setPlaceholder("Selecciona aquí tu VN")
          .addOptions(showcaseTitles),
      );

      const message = await interaction.reply({
        content: "Se han encontrado los siguientes resultados",
        components: [row],
      });

      const filter = (i) => {
        i.deferUpdate();
        return i.user.id === interaction.user.id;
      };

      const collector = message.createMessageComponentCollector({
        filter,
        componentType: ComponentType.StringSelect,
        time: 60000,
      });

      collector.on("end", async (collected) => {
        console.log(`Collected ${collected.size} items`);
        await interaction.editReply({
          components: [],
        });
      });

      // eslint-disable-next-line consistent-return
      collector.on("collect", async (i) => {
        if (!i.user.id === interaction.user.id) {
          return interaction.reply({
            content: "No puedes responder a una interacción que no es tuya.",
            ephemeral: true,
          });
        }

        if (i.customId === "select_item_vn") {
          if (i.values[0] === "close") {
            try {
              await interaction.editReply({
                content: "Resultado de la búsqueda",
                components: [],
              });
            } catch {
              await interaction.deleteReply();
            }
          } else {
            const id = i.values[0];
            response = await axios.post("https://api.vndb.org/kana/vn", {
              filters: ["id", "=", id],
              fields:
                "title, description, votecount, image.url, alttitle, languages, released, platforms, image.sexual, length, length_minutes, rating, screenshots.url",
            });

            console.log("Data obtained", response.data);
            const { title } = response.data.results[0];
            let description = `${response.data.results[0].description}\n`;
            const imageCover = response.data.results[0].image.url;
            const originalTitle = response.data.results[0].alttitle;
            const releaseDate = response.data.results[0].released;
            const developer = null;
            const duration = response.data.results[0].length;
            const durationAvg = Math.round(
              response.data.results[0].length_minutes / 60,
            );
            const { rating } = response.data.results[0].rating;
            const voteCount = response.data.results[0].votecount;
            const availableLanguages = response.data.results[0].languages
              .join(", ")
              .split(", ")
              .map((item) => {
                console.log(item);
                return langNorm[item];
              })
              .toString()
              .replaceAll(",", "\n");

            console.log(availableLanguages);

            while (description.match(/(\n){2}\[.+\]\]/)) {
              description = description.replace(
                description.match(/(\n){2}\[.+\]\]/)[0],
                "",
              );
            }
            while (description.match(/(\n){2}\[.+\]/)) {
              description = description.replace(
                description.match(/(\n){2}\[.+\]/)[0],
                "",
              );
            }
            while (description.match(/\[.+?]/)) {
              description = description.replace(
                description.match(/\[.+?]/)[0],
                "",
              );
            }

            description += `\n**Lenguajes disponibles**\n${availableLanguages} `;

            const fields = [
              {
                name: "❯ Titulo original",
                value: originalTitle || "No disponible",
                inline: true,
              },
              { name: "❯ Lanzamiento", value: releaseDate, inline: true },
              {
                name: "❯ Desarrollador",
                value: developer != null ? `${developer}` : "No disponible",
                inline: true,
              },
              {
                name: "❯ Duración",
                value: durationNorm[duration]
                  ? `${durationNorm[duration]} (∼${durationAvg} horas)`
                  : "No disponible",
                inline: true,
              },
            ];

            if (rating) {
              fields.push({
                name: "❯ Calificación",
                value: `${rating}/100 de ${voteCount} votos`,
                inline: true,
              });
            }

            // Sending data in embed message
            const embedVN = new EmbedBuilder()
              .setURL(`https://vndb.org/${id}`)
              .setTitle(title)
              .setColor("eb868f")
              .setThumbnail(imageCover)
              .setDescription(description)
              .addFields(...fields);

            await interaction.editReply({
              content: "Resultado de la búsqueda",
              embeds: [embedVN],
            });
          }
        }
      });
    }
  },
};
