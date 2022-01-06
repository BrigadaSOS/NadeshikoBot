import { Command } from "../../structures/Command";
import { LogModel } from '../../models/log';
import { MessageEmbed, MessageAttachment } from 'discord.js';
const fs = require('fs').promises;
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const ChartJSImage = require('chart.js-image');

export default new Command({
    name: "log",
    description: "replies with pong",
    options: [
        {
            type: 'SUB_COMMAND',
            name: 'guardar',
            description: 'Registra aquí el contenido con el que hayas hecho inmersión.',
            options: [
                {
                    name: 'tipo',
                    description: '¿Qué tipo de contenido ha consumido?',
                    type: 'STRING',
                    choices: [
                        {
                            "name": "Anime - [Episodios]",
                            "value": "ANIME"
                        },
                        {
                            "name": "Manga - [Capítulos]",
                            "value": "MANGA"
                        },
                        {
                            "name": "Libro - [Páginas]",
                            "value": "BOOK"
                        },
                        {
                            "name": "Novela Visual - [Caracteres]",
                            "value": "VN"
                        }, ///////////////////////////////////////
                        {
                            "name": "Escucha - [Minutos]",
                            "value": "LISTENING"
                        },
                        {
                            "name": "Lectura - [Caracteres]",
                            "value": "READING"
                        },
                        {
                            "name": "Tiempo de Lectura - [Minutos]",
                            "value": "READINGTIME"
                        },
                    ],
                    required: true
                },
                {
                    name: 'cantidad',
                    description: '¿Qué tanto ha consumido?',
                    type: 'INTEGER',
                    required: true
        
                },
                {
                    name: 'detalles',
                    description: 'Detalles del contenido que ha consumido.',
                    type: 'STRING',
                    required: true
                },

            ]
        },
        {
            type: 'SUB_COMMAND',
            name: 'perfil',
            description: 'remove a custom reaction role',
            options: [
                {
                    name: 'rango',
                    description: 'Rango de tiempo de logs a visualizar.',
                    type: 'STRING',
                    choices: [
                        {
                            "name": "Día",
                            "value": "dia"
                        },
                        {
                            "name": "Semana",
                            "value": "semana"
                        },
                        {
                            "name": "Mes",
                            "value": "mes"
                        },
                        {
                            "name": "Año",
                            "value": "año"
                        },
                    ],
                    required: false
                },
                {
                    name: 'usuario',
                    description: 'Usuario a visualizar.',
                    type: 'MENTIONABLE',
                    required: false
                }
            ]
        },
        {
            type: 'SUB_COMMAND',
            name: 'deshacer',
            description: 'Elimina el último registro que hayas hecho.',
        },
        {
            type: 'SUB_COMMAND',
            name: 'historial',
            description: 'sends the reaction-role panel',
        },
        {
            type: 'SUB_COMMAND',
            name: 'información',
            description: 'sends the reaction-role panel',
        },
        {
            type: 'SUB_COMMAND',
            name: 'exportar',
            description: 'sends the reaction-role panel',
        },
        {
            type: 'SUB_COMMAND',
            name: 'ranking',
            description: 'sends the reaction-role panel',
            options: [
                {
                    name: 'categoria',
                    description: 'Categoria a visualizar.',
                    type: 'STRING',
                    choices: [
                        {
                            "name": "Anime",
                            "value": "anime"
                        },
                        {
                            "name": "Manga",
                            "value": "manga"
                        },
                    ],
                }],
        },
    ],
    run: async ({ interaction, client }) => {
        if(interaction.options.getSubcommand() === 'guardar'){
            const type_activity = interaction.options.getString('tipo');
            const amount = interaction.options.getInteger('cantidad');
            const details = interaction.options.getString('detalles')
            const created_at = new Date();
            const discord_guild_id = interaction.guildId;
            const discord_user_id = interaction.user.id;
            
            const data = {
                discord_guild_id: discord_guild_id,
                discord_user_id: discord_user_id,
                type_activity: type_activity,
                create_at: created_at,
                amount: amount,
                details: details
            };
            
            const data2 = {
                discord_user_id: discord_user_id,
                username: interaction.user.username
            }
            
            const currentStoredData = await LogModel.create(data);
            
            interaction.editReply('Log guardado.')

        }else if(interaction.options.getSubcommand() === 'perfil'){
            
            // Current info from user (or selected user)
            let current_user_name = null;
            let current_user_id = null;
            let user_object = null;
            try {
                const user_mention = interaction.options.get('usuario').value;
                if(user_mention){
                    const user_id = user_mention.toString().replace(/\D/g, '');
                    user_object = await client.users.fetch(user_id);
                    current_user_name = user_object.username;
                    current_user_id = user_id.toString();
                }
            } catch (error) {
                current_user_name = interaction.user.username;
                current_user_id = interaction.user.id.toString();
            }

            
            const currentStoredData = await LogModel.findOne({ discord_user_id: current_user_id });

            if (!currentStoredData) {
                await interaction.editReply("No hay ningún log que mostrar.");
                return;
            }

            // Time range conditionals
            const range = await interaction.options.getString('rango');

            const currentDate = new Date();
            const firstDayOfWeek = currentDate.getDate() - currentDate.getDay() + 1;
            let lastInterval = null;
            let firstInterval = null;
            let timeframe = '';
            if(range === 'mes' || range === null){
                lastInterval = new Date(currentDate.getFullYear(), currentDate.getMonth()+1, 0);
                firstInterval = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                timeframe = '(mes)'
            }else if(range ==='semana'){
                firstInterval = new Date(currentDate.setDate(firstDayOfWeek)).toUTCString();
                lastInterval =  new Date(currentDate.setDate(currentDate.getDate()+6)).toUTCString();
                timeframe = '(semana)'
            }else if(range === 'año'){
                firstInterval = new Date(currentDate.getFullYear(), 0, 1);
                lastInterval = new Date(currentDate.getFullYear(), 11, 31)
                timeframe = '(año)'
            }else if(range === 'dia'){
                firstInterval = currentDate.setUTCHours(0,0,0,0);
                lastInterval =  currentDate.setUTCHours(23,59,59,999);
                timeframe = '(día)'
            }

            const resultCursor = await LogModel.aggregate([
                { $match: { 
                    discord_user_id: current_user_id,
                    create_at: {$gte: new Date(firstInterval), $lt: new Date(lastInterval) }
                } },
                { $group: {
                    _id: "$type_activity",
                    total: {
                      $sum: "$amount"
                    }
                  }
                }
            ]) 

            const conversion_en_to_es = {
                ANIME: 'Anime',
                BOOK: 'Libro',
                MANGA: 'Manga',
                VN: 'Novela visual',
                LISTENING: 'Escucha',
                READING: 'Lectura',
                READINGTIME: 'Tiempo de lectura'
            }

            let final_message = ''
            let type_append = ''
            console.log(resultCursor.forEach(result =>{
                console.log(result);
                if(result._id === 'ANIME'){ type_append = 'episodios'}
                if(result._id === 'BOOK'){ type_append = 'páginas'}
                if(result._id === 'MANGA'){ type_append = 'capitulos'}
                if(result._id === 'VN'){ type_append = 'caracteres'}
                if(result._id === 'LISTENING'){ type_append = 'minutos'}
                if(result._id === 'READING'){ type_append = 'caracteres'}
                if(result._id === 'READINGTIME'){ type_append = 'minutos'}

                final_message += `${conversion_en_to_es[result._id]}: ${result.total} ${type_append}.\n`
                }
            ));

            console.log(final_message)

         

            const embed = new MessageEmbed()
                .setTitle(`Perfil de ${current_user_name}`)
                .setColor('#eb868f')
                .setThumbnail(user_object !== null ? user_object.displayAvatarURL({ dynamic: true, size: 1024 }) : interaction.user.displayAvatarURL({ dynamic: true, size: 1024 }))
                .addField(`Resumen ${timeframe}`, `${final_message} `)
                //.setImage('attachment://example.png')

            interaction.editReply({ embeds: [embed]/* files: [attachment]*/ })

        }else if(interaction.options.getSubcommand() === 'deshacer'){
            const current_user_id = interaction.user.id.toString();

            const lastEntryCursor = await LogModel.aggregate([
                { $match: { 
                    discord_user_id: current_user_id,
                } },
                { $sort: {
                    create_at: -1,
                } },
                { $limit: 1 }
            ]) 

            let result2 = null;
            try {
                lastEntryCursor.forEach(async result =>{
                    console.log(result)
                    result2 = result;
                    await LogModel.deleteOne({"_id": result._id})
                });
                interaction.editReply(`Último registro eliminado:\n\`❯ Tipo de contenido: ${result2.type_activity}\`\n\`❯ Detalles: ${result2.details}\`\n\`❯ Cantidad: ${result2.amount}\``)
            } catch (error) {
                if(result2 === null){
                    interaction.editReply('No cuenta con ningún registro a deshacer.')
                }else {
                    interaction.editReply('No ha sido posible eliminar el último registro.')
                }
            }
        
        }else if(interaction.options.getSubcommand() === 'exportar'){
            const current_user_id = interaction.user.id.toString();

            const allDataCursor = await LogModel.aggregate([
                { $match: { 
                    discord_user_id: current_user_id,
                } },
                { $sort: {
                    create_at: -1,
                } },
           ]) 

           console.log(allDataCursor)
         
            const csvWriter = createCsvWriter({
                path: 'log_data.csv',
                header: [
                
                  // Title of the columns (column_names)
                  {id: '_id', title: 'ID'},
                  {id: 'discord_guild_id', title: 'discord_guild_id'},
                  {id: 'discord_user_id', title: 'discord_user_id'},
                  {id: 'type_activity', title: 'type_activity'},
                  {id: 'create_at', title: 'create_at'},
                  {id: 'amount', title: 'amount'},
                  {id: 'details', title: 'details'},
                ]
              });

              if(!allDataCursor.length){
                return interaction.editReply('No cuenta con ningún registro.')
              } 

              csvWriter
                .writeRecords(allDataCursor)
                .then(async ()=> {
                    const attachment = new MessageAttachment(
                        './log_data.csv'
                    );
                    
                    await interaction.editReply({ files: [attachment] });
                
                });
        
        }else if(interaction.options.getSubcommand() === 'ranking'){

        
            const resultCursor = await LogModel.aggregate([
                {
                  '$match': {
                    'type_activity': {
                      '$in': [
                        'ANIME'
                      ]
                    }
                  }
                }, {
                  '$group': {
                    '_id': '$discord_user_id', 
                    'total': {
                      '$sum': '$amount'
                    }
                  }
                }, {
                  '$sort': {
                    'total': -1
                  }
                }, {
                  '$limit': 10
                }
              ]);

            const labels = [];
            const data_cursor = []; 
            resultCursor.forEach(element => {
                console.log(element);
                labels.push(element._id);
                data_cursor.push(element.total)
            });
            console.log(labels);

            const line_chart = ChartJSImage().chart({
                "type": "line",
                "data": {
                  "labels": [
                    "January",
                    "February",
                    "March",
                    "April",
                    "May",
                    "June",
                    "July"
                  ],
                  "datasets": [
                    {
                      "label": "My First dataset",
                      "borderColor": "rgb(255,+99,+132)",
                      "backgroundColor": "rgba(255,+99,+132,+.5)",
                      "data": [
                        57,
                        90,
                        11,
                        -15,
                        37,
                        -37,
                        -27
                      ]
                    },
                    {
                      "label": "My Second dataset",
                      "borderColor": "rgb(54,+162,+235)",
                      "backgroundColor": "rgba(54,+162,+235,+.5)",
                      "data": [
                        71,
                        -36,
                        -94,
                        78,
                        98,
                        65,
                        -61
                      ]
                    },
                    {
                      "label": "My Third dataset",
                      "borderColor": "rgb(75,+192,+192)",
                      "backgroundColor": "rgba(75,+192,+192,+.5)",
                      "data": [
                        48,
                        -64,
                        -61,
                        98,
                        0,
                        -39,
                        -70
                      ]
                    },
                    {
                      "label": "My Fourth dataset",
                      "borderColor": "rgb(255,+205,+86)",
                      "backgroundColor": "rgba(255,+205,+86,+.5)",
                      "data": [
                        -58,
                        88,
                        29,
                        44,
                        3,
                        78,
                        -9
                      ]
                    }
                  ]
                },
                "options": {
                  "title": {
                    "display": true,
                    "text": "Chart.js Line Chart"
                  },
                  "scales": {
                    "xAxes": [
                      {
                        "scaleLabel": {
                          "display": true,
                          "labelString": "Month"
                        }
                      }
                    ],
                    "yAxes": [
                      {
                        "stacked": true,
                        "scaleLabel": {
                          "display": true,
                          "labelString": "Value"
                        }
                      }
                    ]
                  }
                }
              }) // Line chart
              .backgroundColor('white')
              .width(500) // 500px
              .height(300); // 300px
              
              const buffer = await line_chart.toBuffer(); // Promise<Buffer> : Buffer 89 50 4e 47 0d 0a 1a 0a 00 00 00 ...
   
            await fs.writeFile('./example.png', buffer, function(err, result) {
                if(err) console.log('error', err);
              });

            const attachment = new MessageAttachment(
                './example.png'
            );

            //.setImage('attachment://example.png')

            interaction.editReply({ files: [attachment] })

        }
    }
});
