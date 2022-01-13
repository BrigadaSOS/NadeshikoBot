import { Command } from "../../structures/Command";
import { LogModel } from "../../models/log";
import { MessageEmbed, MessageAttachment } from "discord.js";
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
import { ExtendedClient } from "../../structures/Client";
export const client = new ExtendedClient();
var faker = require("community-faker");

export default new Command({
  name: "log",
  description: "replies with pong",
  options: [
    {
      type: "SUB_COMMAND",
      name: "guardar",
      description:
        "Registra aquí el contenido con el que hayas hecho inmersión.",
      options: [
        {
          name: "tipo",
          description: "¿Qué tipo de contenido ha consumido?",
          type: "STRING",
          choices: [
            {
              name: "Anime - [Episodios]",
              value: "ANIME",
            },
            {
              name: "Manga - [Capítulos]",
              value: "MANGA",
            },
            {
              name: "Libro - [Páginas]",
              value: "BOOK",
            },
            {
              name: "Novela Visual - [Caracteres]",
              value: "VN",
            }, 
            {
              name: "Escucha - [Minutos]",
              value: "LISTENING",
            },
            {
              name: "Lectura - [Caracteres]",
              value: "READING",
            },
            {
              name: "Tiempo de Lectura - [Minutos]",
              value: "READINGTIME",
            },
          ],
          required: true,
        },
        {
          name: "cantidad",
          description: "¿Qué tanto ha consumido?",
          type: "INTEGER",
          required: true,
        },
        {
          name: "detalles",
          description: "Detalles del contenido que ha consumido.",
          type: "STRING",
          required: true,
        },
      ],
    },
    {
      type: "SUB_COMMAND",
      name: "perfil",
      description: "Revisa tu perfil actual de tus logs.",
      options: [
        {
          name: "rango",
          description: "Rango de tiempo de logs a visualizar.",
          type: "STRING",
          choices: [
            {
              name: "Día",
              value: "dia",
            },
            {
              name: "Semana",
              value: "semana",
            },
            {
              name: "Mes",
              value: "mes",
            },
            {
              name: "Año",
              value: "año",
            },
          ],
          required: false,
        },
        {
          name: "usuario",
          description: "Usuario a visualizar.",
          type: "MENTIONABLE",
          required: false,
        },
      ],
    },
    {
      type: "SUB_COMMAND",
      name: "deshacer",
      description: "Elimina el último registro que hayas hecho.",
    },
    {
      type: "SUB_COMMAND",
      name: "historial",
      description: "Mira el historial de tus últimos logs.",
    },
    {
      type: "SUB_COMMAND",
      name: "información",
      description: "Información sobre los comandos de log.",
    },
    {
      type: "SUB_COMMAND",
      name: "exportar",
      description: "Exporta todo tu historial de logs en formato CSV.",
    },
    {
      type: "SUB_COMMAND",
      name: "ranking",
      description: "Ranking por categorías.",
      options: [
        {
          name: "categoria",
          description: "Categoria a visualizar.",
          type: "STRING",
          required: true,
          choices: [
            {
              name: "Anime",
              value: "ANIME",
            },
            {
              name: "Manga",
              value: "MANGA",
            },
            {
              name: "Libro",
              value: "BOOK",
            },
            {
              name: "Novela Visual",
              value: "VN",
            }, 
            {
              name: "Escucha",
              value: "LISTENING",
            },
            {
              name: "Lectura",
              value: "READING",
            },
            {
              name: "Tiempo de Lectura",
              value: "READINGTIME",
            },
          ],
        },
        {
          name: "intervalo",
          description: "Intervalo de tiempo de ranking a visualizar.",
          type: "STRING",
          choices: [
            {
              name: "Semana",
              value: "semana",
            },
            {
              name: "Mes",
              value: "mes",
            },
            {
              name: "Año",
              value: "año",
            },
          ],
          required: true,
        },
      ],
    },
  ],
  run: async ({ interaction, client }) => {

    if (interaction.options.getSubcommand() === "guardar") {

      const type_activity = interaction.options.getString("tipo");
      const amount = interaction.options.getInteger("cantidad");
      const details = interaction.options.getString("detalles");
      const created_at = new Date();
      const discord_guild_id = interaction.guildId;
      const discord_user_id = interaction.user.id;

      const data = {
        discord_guild_id: discord_guild_id,
        discord_user_id: discord_user_id,
        type_activity: type_activity,
        create_at: created_at,
        amount: amount,
        details: details,
      };

      let dates_list = await getDateTime('mes');
      let firstInterval = dates_list[0];
      let lastInterval = dates_list[1];
      let timeframe = dates_list[2];

      const amountCursor = await LogModel.aggregate([
        {
          $match: {
            discord_user_id: discord_user_id,
            create_at: {
              $gte: new Date(firstInterval),
              $lt: new Date(lastInterval),
            },
          },
        },
        {
          $group: {
            _id: "$type_activity",
            total: {
              $sum: "$amount",
            },
          },
        },
      ]);

      const currentStoredData = await LogModel.create(data);
      console.log(currentStoredData);

      let coincidence = null;
      amountCursor.forEach((resultAmount) =>{
        console.log(resultAmount)
        if(currentStoredData.type_activity === resultAmount._id){
          coincidence = resultAmount.total;
        }
      });

      const conversion_en_to_es = {
        ANIME: "Anime",
        BOOK: "Libro",
        MANGA: "Manga",
        VN: "Novela visual",
        LISTENING: "Escucha",
        READING: "Lectura",
        READINGTIME: "Tiempo de lectura",
      };

      interaction.editReply(`**¡Se ha guardado el log!**\nTotal para la categoría "${ conversion_en_to_es[currentStoredData.type_activity.toString()]}" (mes): ~~${coincidence}~~  →  ${coincidence+currentStoredData.amount} \n\n**Detalles del log guardado:**\nFecha de creación: \`${currentStoredData.create_at.toISOString().slice(0, 10)}\`\nTipo de contenido: \`${currentStoredData.type_activity}\`\nDetalles: ${currentStoredData.details}\nCantidad: \`${currentStoredData.amount}\`\n`);
    
    } else if (interaction.options.getSubcommand() === "perfil") {
      // Current info from user (or selected user)
      let current_user_name = null;
      let current_user_id = null;
      let user_object = null;
      try {
        const user_mention = interaction.options.get("usuario").value;
        if (user_mention) {
          const user_id = user_mention.toString().replace(/\D/g, "");
          user_object = await client.users.fetch(user_id);
          current_user_name = user_object.username;
          current_user_id = user_id.toString();
        }
      } catch (error) {
        current_user_name = interaction.user.username;
        current_user_id = interaction.user.id.toString();
      }

      const currentStoredData = await LogModel.findOne({
        discord_user_id: current_user_id,
      });

      if (!currentStoredData) {
        await interaction.editReply("No hay ningún log que mostrar.");
        return;
      }

      let range = interaction.options.getString("rango");

      if (!range) {
        range = "mes";
      }

      let dates_list = await getDateTime(range);
      let firstInterval = dates_list[0];
      let lastInterval = dates_list[1];
      let timeframe = dates_list[2];

      const resultCursor = await LogModel.aggregate([
        {
          $match: {
            discord_user_id: current_user_id,
            create_at: {
              $gte: new Date(firstInterval),
              $lt: new Date(lastInterval),
            },
          },
        },
        {
          $group: {
            _id: "$type_activity",
            total: {
              $sum: "$amount",
            },
          },
        },
      ]);

      const conversion_en_to_es = {
        ANIME: "Anime",
        BOOK: "Libro",
        MANGA: "Manga",
        VN: "Novela visual",
        LISTENING: "Escucha",
        READING: "Lectura",
        READINGTIME: "Tiempo de lectura",
      };

      let final_message = "";
      let category_append = "";
      if (resultCursor.length === 0) {
        return interaction.editReply("No hay datos que mostrar.");
      }
      console.log(
        resultCursor.forEach((result) => {
          console.log(result);
          let category_append = normalizerAmount(result._id);

          final_message += `**${conversion_en_to_es[result._id]}:** ${
            result.total
          } ${category_append}\n`;
        })
      );

      console.log(final_message);

      const embed = new MessageEmbed()
        .setTitle(`Perfil de ${current_user_name}`)
        .setColor("#eb868f")
        .setThumbnail(
          user_object !== null
            ? user_object.displayAvatarURL({ dynamic: true, size: 1024 })
            : interaction.user.displayAvatarURL({ dynamic: true, size: 1024 })
        )
        .addField(`Resumen ${timeframe}`, `${final_message} `);
      //.setImage('attachment://example.png')

      interaction.editReply({ embeds: [embed] /* files: [attachment]*/ });
    } else if (interaction.options.getSubcommand() === "deshacer") {
      const current_user_id = interaction.user.id.toString();

      const lastEntryCursor = await LogModel.aggregate([
        {
          $match: {
            discord_user_id: current_user_id,
          },
        },
        {
          $sort: {
            create_at: -1,
          },
        },
        { $limit: 1 },
      ]);

      let result2 = null;
      try {
        lastEntryCursor.forEach(async (result) => {
          console.log(result);
          result2 = result;
          await LogModel.deleteOne({ _id: result._id });
        });
        interaction.editReply(
          `Último registro eliminado:\n\`❯ Tipo de contenido: ${result2.type_activity}\`\n\`❯ Detalles: ${result2.details}\`\n\`❯ Cantidad: ${result2.amount}\``
        );
      } catch (error) {
        if (result2 === null) {
          interaction.editReply("No cuenta con ningún registro a deshacer.");
        } else {
          interaction.editReply(
            "No ha sido posible eliminar el último registro."
          );
        }
      }
    } else if (interaction.options.getSubcommand() === "exportar") {
      const current_user_id = interaction.user.id.toString();

      const allDataCursor = await LogModel.aggregate([
        {
          $match: {
            discord_user_id: current_user_id,
          },
        },
        {
          $sort: {
            create_at: -1,
          },
        },
      ]);

      console.log(allDataCursor);

      const csvWriter = createCsvWriter({
        path: "log_data.csv",
        header: [
          // Title of the columns (column_names)
          { id: "_id", title: "ID" },
          { id: "discord_guild_id", title: "discord_guild_id" },
          { id: "discord_user_id", title: "discord_user_id" },
          { id: "type_activity", title: "type_activity" },
          { id: "create_at", title: "create_at" },
          { id: "amount", title: "amount" },
          { id: "details", title: "details" },
        ],
      });

      if (!allDataCursor.length) {
        return interaction.editReply("No cuenta con ningún registro.");
      }

      csvWriter.writeRecords(allDataCursor).then(async () => {
        const attachment = new MessageAttachment("./log_data.csv");

        await interaction.editReply({ files: [attachment] });
      });
    } else if (interaction.options.getSubcommand() === "ranking") {
      const category = interaction.options.getString("categoria");
      const range2 = interaction.options.getString("intervalo");
      let dates_list2 = await getDateTime(range2);
      let firstInterval2 = dates_list2[0];
      let lastInterval2 = dates_list2[1];
      let timeframe2 = dates_list2[2];

      console.log(category)
      console.log(firstInterval2 + "--" + lastInterval2);
      const resultCursor = await LogModel.aggregate([
        {
          $match: {
            type_activity: {
              $in: [category.toUpperCase()],
            },
            create_at: {
              $gte: new Date(firstInterval2),
              $lt: new Date(lastInterval2),
            },
          },
        },
        {
          $group: {
            _id: {
              __alias_0: "$discord_user_id",
              __alias_1: "$type_activity",
            },
            __alias_2: {
              $sum: "$amount",
            },
          },
        },
        {
          $project: {
            _id: 0,
            __alias_0: "$_id.__alias_0",
            __alias_1: "$_id.__alias_1",
            __alias_2: 1,
          },
        },
        {
          $project: {
            id: "$__alias_0",
            type: "$__alias_1",
            amount: "$__alias_2",
            _id: 0,
          },
        },
        {
          $addFields: {
            __agg_sum: {
              $sum: ["$amount"],
            },
          },
        },
        {
          $group: {
            _id: {
              id: "$id",
            },
            __grouped_docs: {
              $push: "$$ROOT",
            },
            __agg_sum: {
              $sum: "$__agg_sum",
            },
          },
        },
        {
          $sort: {
            __agg_sum: -1,
          },
        },
        {
          $limit: 10,
        },
        {
          $unwind: "$__grouped_docs",
        },
        {
          $replaceRoot: {
            newRoot: "$__grouped_docs",
          },
        },
        {
          $project: {
            __agg_sum: 0,
          },
        },
        {
          $limit: 5000,
        },
      ]);

      let ranking_text = "";
      let position_ranking = 1;

      let user = null;

      let promises = resultCursor.map(async (element) => {
        user = await client.users.fetch(element.id).catch((error) => {
          element.id = faker.name.findName();
        });

        try {
          element.id = user.username;
        } catch (error) {}
        return new Promise((res, rej) => {
          res(element);
        });
      });

      Promise.all(promises).then((results) => {
        let position_ranking = 1;
        const conversion_en_to_es = {
          ANIME: "Anime",
          BOOK: "Libro",
          MANGA: "Manga",
          VN: "Novela visual",
          LISTENING: "Escucha",
          READING: "Lectura",
          READINGTIME: "Tiempo de lectura",
        };
        
        results.forEach((result) => {
          console.log(result);
          let category_append = normalizerAmount(result["type"]);
          ranking_text += `${position_ranking}) ${result["id"]}: ${result["amount"]} ${category_append}.\n`;
          position_ranking += 1;
        });
        const embed = new MessageEmbed()
          .setTitle(`Ranking [${conversion_en_to_es[category]}] ${timeframe2}`)
          .setColor("#eb868f")
          .setDescription(ranking_text);
        interaction.editReply({ embeds: [embed] });
      });

    }else if (interaction.options.getSubcommand() === "historial") {
      const current_user_id = interaction.user.id.toString();
      const historyCursor = await LogModel.aggregate([
        {
          $match: {
            discord_user_id: current_user_id,
          },
        },
        {
          $sort: {
            create_at: -1,
          },
        },
        { $limit: 15 },
      ]);

      let final_text = 'Logs más recientes```js\nFecha | Tipo | Detalles | Cantidad\n';
      historyCursor.forEach((item) => {
        final_text += `${item.create_at.toISOString().slice(0, 10)} | ${item.type_activity} | ${item.details} | ${item.amount}\n`
      })
      final_text += '```';

      interaction.editReply(final_text);

    }
  },
});

//////////////////////////////////////////////////////////////////////////////

function normalizerAmount(category) {
  let category_append = null;
  if (category === "ANIME") {
    category_append = "episodios";
  }
  if (category === "BOOK") {
    category_append = "páginas";
  }
  if (category === "MANGA") {
    category_append = "capitulos";
  }
  if (category === "VN") {
    category_append = "caracteres";
  }
  if (category === "LISTENING") {
    category_append = "minutos";
  }
  if (category === "READING") {
    category_append = "caracteres";
  }
  if (category === "READINGTIME") {
    category_append = "minutos";
  }
  return category_append;
}

async function getDateTime(range) {
  let currentDate = new Date();
  let firstDayOfWeek = currentDate.getDate() - currentDate.getDay() + 1;
  let lastInterval = null;
  let firstInterval = null;
  let timeframe = "";
  if (range === "mes" || range === null) {
    lastInterval = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );
    firstInterval = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    timeframe = "Mes";
  } else if (range === "semana") {
    firstInterval = new Date(currentDate.setDate(firstDayOfWeek)).toUTCString();
    lastInterval = new Date(
      currentDate.setDate(currentDate.getDate() + 6)
    ).toUTCString();
    timeframe = "Semana";
  } else if (range === "año") {
    firstInterval = new Date(currentDate.getFullYear(), 0, 1);
    lastInterval = new Date(currentDate.getFullYear(), 11, 31);
    timeframe = "Año";
  } else if (range === "dia") {
    firstInterval = currentDate.setUTCHours(0, 0, 0, 0);
    lastInterval = currentDate.setUTCHours(23, 59, 59, 999);
    timeframe = "Día";
  }
  let final_dates = [firstInterval, lastInterval, timeframe];
  return final_dates;
}
