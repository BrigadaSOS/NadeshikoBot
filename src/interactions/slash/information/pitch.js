const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const axios = require("axios");
const { JPDB_API_KEY } = require("../../../bot-config");

// load pitch db
const pitchJSON = require("../../../db_pitch.json");

const jpdbWordToFormattedPitch = (wordData) => {
  const [_, reading, pitchData] = wordData;
  const results = [];

  for (const pitch of pitchData) {
    let pitchNum = pitch.lastIndexOf("H") == reading.length ? 0 : pitch.lastIndexOf("H") + 1;
    let wordWithFormattedPitch = pitchNum === 0 ? `${reading}￣` : reading.slice(0, pitchNum) + "╲" + reading.slice(pitchNum);
    results.push(`[${pitchNum}] ${wordWithFormattedPitch} ｜ ${pitch}`);
  }

  console.log(results);
  return results;
};

const jsonWordToFormattedPitch = (spelling, reading) => {

  // JSON FORMAT
  // key: `${spelling}+${reading}`
  // values: [array of pitch data(imt), source(string)]

  const key = `${spelling}+${reading}`;
  const pitchData = (key in pitchJSON) ? pitchJSON[key] : null;

  if (pitchData == null) {
    return [[], []];
  }

  const results = [];
  const sources = []

  for (const [dictionaryName, pitches] of Object.entries(pitchJSON[key])) {
    for (let i = 0; i < pitches.length; i++) {
      const pitch = pitches[i]
      let wordWithFormattedPitch = pitch === 0 ? `${reading}￣` : reading.slice(0, pitch) + "╲" + reading.slice(pitch);
      results.push(`[${pitch}] ${wordWithFormattedPitch}`);
      sources.push(dictionaryName);
    }
  }

  return [sources, results];
};

const buildResponseBody = (query, jpdbInfo) => {
  const { vocabulary } = jpdbInfo.data;

  let commandOutput = ``;

  if (vocabulary.length > 0) {
    for (const wordData of vocabulary) {
      const [spelling, reading] = wordData;
      console.log(spelling, reading)

      const formattedPitchwords = jpdbWordToFormattedPitch(wordData);

      commandOutput += `**${spelling}［${reading}］- [jpdb](https://jpdb.io/search?q=${spelling}&lang=english):**\n`;
      for (const formattedPitchword of formattedPitchwords) {
        commandOutput += `* ${formattedPitchword}\n`;
      }

      // custom db
      const [jsonSources, jsonPitchWords] = jsonWordToFormattedPitch(spelling, reading);
      let lastSource = "";
      for (let i = 0; i < jsonSources.length; i++) {
        if (lastSource !== jsonSources[i]) {
          commandOutput += `\n** ${spelling}［${reading}］- ${jsonSources[i]}:**\n`;
          lastSource = jsonSources[i];
        }
        commandOutput += `* ${jsonPitchWords[i]}\n`;
      }
    }
  } else {
    commandOutput += "No se ha encontrado información.";
  }

  const embed = new EmbedBuilder()
    .setTitle(`Pitch Accent de: ${query}`)
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
