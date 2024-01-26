const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const axios = require("axios");
const { JPDB_API_KEY } = require("../../../bot-config");

const wordToFormattedPitch = (wordData) => {
  const [_, reading, pitchData] = wordData;
  const results = [];

  for (const pitch of pitchData) {
    let wordWithFormattedPitch = reading[0];
    let previousPitch = pitch[0];
    for (let i = 1; i < reading.length; i += 1) {
      if (previousPitch === "H" && pitch[i] === "L") {
        wordWithFormattedPitch += "╲";
      }
      wordWithFormattedPitch += reading[i];
      previousPitch = pitch[i];
    }

    if (pitch.length > reading.length) {
      if (previousPitch === "H" && pitch[pitch.length - 1] === "L") {
        wordWithFormattedPitch += "╲";
      }
    }

    wordWithFormattedPitch += ` ー ${pitch}`;

    results.push(wordWithFormattedPitch);
  }

  console.log(results);
  return results;
};

const buildResponseBody = (query, jpdbInfo) => {
  const { vocabulary } = jpdbInfo.data;

  let commandOutput = ``;

  if (vocabulary.length > 0) {
    for (const wordData of vocabulary) {
      const [spelling, reading] = wordData;

      const formattedPitchwords = wordToFormattedPitch(wordData);

      commandOutput += `### ${spelling}［${reading}］- [jpdb](https://jpdb.io/search?q=${spelling}&lang=english):\n`;
      for (const formattedPitchword of formattedPitchwords) {
        commandOutput += `* ${formattedPitchword}\n`;
      }
    }
  }

  const embed = new EmbedBuilder()
    .setTitle(`Información de pitch accent para: ${query}`)
    .setDescription(commandOutput);

  return {
    // content: commandOutput,
    embeds: [embed],
    options: {},
  };
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pitch")
    .setDescription("Obtén información del pitch accent de una palabra.")
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("Escribe la palabra a buscar.")
        .setRequired(true),
    ),
  async execute(interaction) {
    if (!JPDB_API_KEY) {
      console.warn("JPDB_API_KEY not set.");
      await interaction.reply({
        content: "Este comando no está disponible ahora mismo.",
        ephemeral: true,
      });
      return;
    }
    await interaction.deferReply();

    const query = interaction.options.getString("query");

    const jpdbInfo = await axios.post(
      "https://jpdb.io/api/v1/parse",
      {
        text: query,
        position_length_encoding: "utf16",
        token_fields: [],
        vocabulary_fields: ["spelling", "reading", "pitch_accent"],
      },
      {
        headers: {
          Authorization: `Bearer ${JPDB_API_KEY}`,
          ContentType: "application/json",
        },
      },
    );

    console.log("Response", jpdbInfo);
    if (jpdbInfo.status !== 200) {
      await interaction.editReply(
        "Ha habido un error, inténtelo de nuevo más tarde.",
      );
      return;
    }

    await interaction.editReply(buildResponseBody(query, jpdbInfo));
  },
};
