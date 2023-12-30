const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ComponentEmojiResolvable,
  ComponentType,
  ButtonBuilder,
} = require("discord.js");

const axios = require("axios");
const fs = require("fs");
const { Readable } = require("stream");

const { NADEDB_API_KEY } = require("../../../bot-config");

const buildResponseBody = (query, sentences, index) => {
  const sentence = sentences[index];

  const { name_anime_en, season, episode } = sentence.basic_info;
  const {
    uuid,
    content_en,
    content_en_highlight,
    content_es,
    content_es_highlight,
    content_jp,
    content_jp_highlight,
  } = sentence.segment_info;
  const { path_video } = sentence.media_info;

  const jp_sentence = (content_jp_highlight || content_jp || "").replace(
    /<em>(.*?)<\/em>/g,
    "**$1**",
  );
  const es_sentence = (content_es_highlight || content_es || "").replace(
    /<em>(.*?)<\/em>/g,
    "**$1**",
  );
  const en_sentence = (content_en_highlight || content_en || "").replace(
    /<em>(.*?)<\/em>/g,
    "**$1**",
  );

  let description = `### [${index + 1}/${
    sentences.length
  }] Resultados:\n> :flag_jp:  ${jp_sentence}`;
  if (es_sentence) {
    description += `\n> :flag_es:  ${es_sentence}`;
  }
  if (en_sentence) {
    description += `\n> :flag_us:  ${en_sentence}`;
  }

  description += `\n\nhttps://db.brigadasos.xyz/search/sentences?query=${query}`;

  let sourceString = `### Fuente:\n${name_anime_en} • `;
  if (season) {
    sourceString += `Temporada ${season},`;
  }
  if (episode) {
    sourceString += ` Episodio ${episode}`;
  }
  sourceString += `\n${path_video}`;

  description += `\n${sourceString}`;

  const first = new ButtonBuilder()
    .setCustomId("first")
    .setEmoji("⏮️")
    .setStyle(1);

  const last = new ButtonBuilder()
    .setCustomId("last")
    .setEmoji("⏭️")
    .setStyle(1);

  const prev = new ButtonBuilder()
    .setCustomId("prev")
    .setEmoji("◀")
    .setStyle(1);

  const next = new ButtonBuilder()
    .setCustomId("next")
    .setEmoji("▶")
    .setStyle(1);

  if (index === 0) {
    first.setDisabled(true);
    prev.setDisabled(true);
  }

  if (index === sentences.length - 1) {
    last.setDisabled(true);
    next.setDisabled(true);
  }

  const row = new ActionRowBuilder().addComponents(first, prev, next, last);

  return {
    content: description,
    components: [row],
  };
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("nadedb")
    .setDescription("Busca información dentro de la base de datos de NadeDB.")
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("Escribe la palabra a buscar.")
        .setRequired(true),
    ),
  async execute(interaction) {
    if (!NADEDB_API_KEY) {
      await interaction.reply({
        content: "Este comando no está activado ahora mismo.",
        ephemeral: true,
      });
      return;
    }
    await interaction.deferReply();

    const query = interaction.options.getString("query");

    const response = await axios.post(
      "https://api.brigadasos.xyz/api/v1/search/anime/sentence",
      {
        query,
        content_sort: "random",
        random_seed: Math.floor(Math.random() * 65535),
        limit: 10,
      },
      {
        headers: {
          "x-api-key": NADEDB_API_KEY,
        },
      },
    );

    console.log("Response", response);
    if (response.status !== 200) {
      await interaction.editReply(
        "NadeDB no está disponible. Inténtelo más tarde o visite la página web: https://db.brigadasos.xyz",
      );
      return;
    }
    const { sentences } = response.data;

    if (sentences === undefined || sentences.length === 0) {
      await interaction.editReply("No se han encontrado resultados.");
      return;
    }

    let index = 0;

    const result = await interaction.editReply(
      buildResponseBody(query, sentences, index),
    );

    const filter = (i) => {
      i.deferUpdate();
      return i.user.id === interaction.user.id;
    };

    const collector = result.createMessageComponentCollector({
      filter,
      componentType: ComponentType.Button,
      time: 120000,
    });

    collector.on("end", async (i) => {
      await interaction.editReply({
        components: [],
      });
    });

    collector.on("collect", async (i) => {
      switch (i.customId) {
        case "first":
          index = 0;
          break;

        case "next":
          index += 1;
          break;

        case "prev":
          index -= 1;
          break;

        case "last":
          index = sentences.length - 1;
          break;

        default:
          break;
      }

      await interaction.editReply(buildResponseBody(query, sentences, index));
    });
  },
};
