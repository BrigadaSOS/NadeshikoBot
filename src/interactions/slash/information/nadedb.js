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
    const { uuid, content_en, content_es, content_highlight } =
      sentence.segment_info;
    const { path_image, path_audio } = sentence.media_info;

    const content_highlight_parsed = content_highlight.replace(
      /<span class="keyword">(.*?)<\/span>/g,
      "**$1**",
    );

    let description = `:flag_jp: ${content_highlight_parsed}`;
    const sentenceFields = [
      { name: ":flag_jp:", value: content_highlight_parsed },
    ];
    if (content_es) {
      description += `\n\n:flag_es: ${content_es}`;
      sentenceFields.push({ name: ":flag_es:", value: content_es });
    }
    if (content_en) {
      description += `\n\n:flag_us: ${content_en}`;
      sentenceFields.push({ name: ":flag_us:", value: content_en });
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

    // TODO: Include audio as attachment
    // const res = await axios.get(path_audio, {
    //   responseType: "arraybuffer",
    // });

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
      .setURL(`https://db.brigadasos.xyz`)
      .setTitle(query)
      // .setDescription(description)
      .addFields(...sentenceFields)
      .addFields(...mediaFields)
      .setImage(path_image)
      .setFooter({
        text: footerString,
      });

    const result = await interaction.editReply({
      embeds: [embedSentence],
      components: [row],
    });

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
      const { uuid, content_en, content_es, content_highlight } =
        sentence.segment_info;
      const { path_image, path_audio } = sentence.media_info;

      const content_highlight_parsed = content_highlight.replace(
        /<span class="keyword">(.*?)<\/span>/g,
        "**$1**",
      );

      let description = `:flag_jp: ${content_highlight_parsed}`;
      const sentenceFields = [
        { name: ":flag_jp:", value: content_highlight_parsed },
      ];
      if (content_es) {
        description += `\n\n:flag_es: ${content_es}`;
        sentenceFields.push({ name: ":flag_es:", value: content_es });
      }
      if (content_en) {
        description += `\n\n:flag_us: ${content_en}`;
        sentenceFields.push({ name: ":flag_us:", value: content_en });
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

      // TODO: Include audio as attachment
      // const res = await axios.get(path_audio, {
      //   responseType: "arraybuffer",
      // });

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
        .setURL(`https://db.brigadasos.xyz`)
        .setTitle(query)
        // .setDescription(description)
        .addFields(...sentenceFields)
        .addFields(...mediaFields)
        .setImage(path_image)
        .setFooter({
          text: footerString,
        });

      const result = await interaction.editReply({
        embeds: [embedSentence],
        components: [row],
      });
    });
  },
};
