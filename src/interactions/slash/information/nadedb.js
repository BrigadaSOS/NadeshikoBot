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
        limit: 5,
      },
      {
        headers: {
          "x-api-key": NADEDB_API_KEY,
        },
      },
    );

    // TODO: Check response is 2XX
    console.log("Response", response.data);

    let index = 1;
    const { sentences } = response.data;
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
    const { path_audio, path_video } = sentence.media_info;

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

    let description = `:flag_jp:  ${jp_sentence}`;
    if (content_es) {
      description += `\n\n:flag_es:  ${content_es}`;
    }
    if (en_sentence) {
      description += `\n\n:flag_us:  ${content_en}`;
    }

    let footerString = `${name_anime_en} • `;
    if (season) {
      footerString += `Temporada ${season},`;
    }
    if (episode) {
      footerString += ` Episodio ${episode}`;
    }

    const mediaFields = [
      {
        name: "Audio",
        value: path_audio,
      },
    ];

    const prev = new ButtonBuilder()
      .setCustomId("prev")
      .setEmoji("◀")
      .setStyle(1);

    const next = new ButtonBuilder()
      .setCustomId("next")
      .setEmoji("▶")
      .setStyle(1);

    if (index === 0) {
      prev.setDisabled(true);
    }

    if (index === sentences.length - 1) {
      next.setDisabled(true);
    }

    const row = new ActionRowBuilder().addComponents(prev, next);

    // Sending data in embed message
    const embedSentence = new EmbedBuilder()
      .setURL(`https://db.brigadasos.xyz/search/sentences?uuid=${uuid}`)
      .setTitle(query)
      .setFields(
        ...[
          {
            name: "Frase",
            value: description,
          },
        ],
        ...mediaFields,
      )
      .setFooter({
        text: footerString,
      });

    const result = await interaction.editReply({
      embeds: [embedSentence],
      components: [row],
    });

    const mediaMessage = await interaction.followUp(path_video);

    const filter = (i) => {
      i.deferUpdate();
      return i.user.id === interaction.user.id;
    };

    const collector = result.createMessageComponentCollector({
      filter,
      componentType: ComponentType.Button,
      time: 60000,
    });

    collector.on("end", async (i) => {
      await interaction.editReply({
        components: [],
      });
    });

    collector.on("collect", async (i) => {
      console.log(i);
      if (i.customId === "next") {
        index += 1;
      } else if (i.customId === "prev") {
        index -= 1;
      }

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
      const { path_audio, path_video } = sentence.media_info;

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

      let description = `:flag_jp:  ${jp_sentence}`;
      if (content_es) {
        description += `\n\n:flag_es:  ${content_es}`;
      }
      if (en_sentence) {
        description += `\n\n:flag_us:  ${content_en}`;
      }

      let footerString = `${name_anime_en} • `;
      if (season) {
        footerString += `Temporada ${season},`;
      }
      if (episode) {
        footerString += ` Episodio ${episode}`;
      }

      const mediaFields = [
        {
          name: "Audio",
          value: path_audio,
        },
      ];

      const prev = new ButtonBuilder()
        .setCustomId("prev")
        .setEmoji("◀")
        .setStyle(1);

      const next = new ButtonBuilder()
        .setCustomId("next")
        .setEmoji("▶")
        .setStyle(1);

      if (index === 0) {
        prev.setDisabled(true);
      }

      if (index === sentences.length - 1) {
        next.setDisabled(true);
      }

      const row = new ActionRowBuilder().addComponents(prev, next);

      // Sending data in embed message
      const embedSentence = new EmbedBuilder()
        .setURL(`https://db.brigadasos.xyz/search/sentences?uuid=${uuid}`)
        .setTitle(query)
        .setFields(
          ...[
            {
              name: "Frase",
              value: description,
            },
          ],
          ...mediaFields,
        )
        .setFooter({
          text: footerString,
        });

      const result = await interaction.editReply({
        embeds: [embedSentence],
        components: [row],
      });

      await mediaMessage.edit(path_video);
    });
  },
};
