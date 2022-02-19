import { Command } from "../../structures/Command";
const { MessageEmbed } = require('discord.js');
const axios = require('axios').default;

const base_api = 'http://radio.garden/api/'
const { createAudioPlayer, createAudioResource, joinVoiceChannel } = require('@discordjs/voice');
var faker = require('community-faker');
const player = createAudioPlayer();

export default new Command({
    name: "radio",
    description: "Coloca la radio de cualquier lugar",
    options: [
      {
        type: "SUB_COMMAND",
        name: "buscar",
        description:
          "Busca una emisora por nombre.",
        options: [
          {
            name: "query",
            description: "Nombre de la estación",
            type: "STRING",
            required: true,
          },
        ],
      },
      {
        type: "SUB_COMMAND",
        name: "play",
        description:
          "Reproduce una emisora por código/nombre.",
        options: [
          {
            name: "query",
            description: "Nombre o código de la estación",
            type: "STRING",
            required: true,
          },
        ],
      },
      {
        type: "SUB_COMMAND",
        name: "stop",
        description:
          "Detiene la emisora.",
      },
      {
        type: "SUB_COMMAND",
        name: "random",
        description:
          "Reproduce una emisora aleatoria.",
      },
    ],
    run: async ({ interaction, client }) => {
        if (interaction.options.getSubcommand() === "buscar") {
            const query = interaction.options.getString("query");
            const base_api_search = `${base_api}search?q=${query}`

            let response = null;
            try {
              response = await axios.get(base_api_search);
            } catch (error) {
              return interaction.editReply('No se han encontrado resultados.')
            }

            let string_hits = '';
            let index_hits = 0;
            let code_radio = '';

            response.data.hits.hits.forEach(element => {
                if(element._source.type === 'channel'){
                    index_hits += 1;
                    code_radio = element._source.url.split('/')
                    string_hits += `**${index_hits})** ${element._source.title} (${element._source.subtitle}) | \`${code_radio.at(-1)}\`\n`
                }
            });

            const embedHits = new MessageEmbed()
            .setTitle(`Emisoras encontradas`)
            .setDescription(string_hits)
            .setColor('#FAD02C')

            interaction.editReply({ embeds: [embedHits] })

        } if (interaction.options.getSubcommand() === "play") {
          const query = interaction.options.getString("query");
          const base_api_play = `${base_api}ara/content/listen/${query}/channel.mp3`
          
        await playAudio(interaction, base_api_play)

        const response_info = await getRadioInfo(query);
        
        const name_radio = response_info.data.data.title; 
        const url_radio = response_info.data.data.website;
        const country_radio = response_info.data.data.country.title;
        const city_radio = response_info.data.data.place.title;
        const id_radio = response_info.data.data.id;

        const radioPlayEmbed = new MessageEmbed()
        .setColor('77C66E')
        .setTitle(`**Reproduciendo emisora**`)
        .addField('Nombre',name_radio, true )
        .addField('País', country_radio, true)
        .addField('Ciudad', city_radio, true)
        .addField('ID', id_radio, true)
        .setTimestamp()
        .setURL(url_radio)

        await interaction.editReply({ embeds: [radioPlayEmbed]});
     
        } if (interaction.options.getSubcommand() === "random") {
    

        let response = null;
        let query = null;
        let hits_response = []
        while(hits_response.length === 0){
          query = await generateRandomItem();
          response = await searchGarden(query);
          response.data.hits.hits.forEach(element => {
            if(element._source.type === 'channel'){
              hits_response.push(element);
            }
          });
        }

         console.log('------------');
         console.log(response.data.hits.hits[1]);
         console.log('///////////////');
         console.log(hits_response);

          let code_radio = hits_response[0]._source.url.split('/')
          let base_api_play = `${base_api}ara/content/listen/${code_radio.at(-1)}/channel.mp3`
          await playAudio(interaction, base_api_play);

          
        let response_info = await getRadioInfo(code_radio.at(-1));
        
        let name_radio = response_info.data.data.title; 
        let url_radio = response_info.data.data.website;
        let country_radio = response_info.data.data.country.title;
        let city_radio = response_info.data.data.place.title;
        let id_radio = response_info.data.data.id;

        let radioPlayEmbed = new MessageEmbed()
        .setColor('77C66E')
        .setTitle(`**Reproduciendo emisora**`)
        .addField('Nombre',name_radio, true )
        .addField('País', country_radio, true)
        .addField('Ciudad', city_radio, true)
        .addField('ID', id_radio, true)
        .setTimestamp()
        .setURL(url_radio)

        await interaction.editReply({ embeds: [radioPlayEmbed]});


        }if (interaction.options.getSubcommand() === "stop") {
        
          player.stop()
          interaction.editReply('Se ha detenido la emisora.')

        }
    }
});

async function playAudio(interaction, audio){
  const resource = createAudioResource(audio)
  player.play(resource)
  const connection = joinVoiceChannel({
    channelId: interaction.member.voice.channel.id,
    guildId: interaction.guild.id,
    adapterCreator: interaction.guild.voiceAdapterCreator,
});

const subscription = await connection.subscribe(player)

}

async function searchGarden(query){
  const base_api_search = `${base_api}search?q=${query}`
  const response = await axios.get(base_api_search);
  return response;
}
async function generateRandomItem(){
  let option = null;
  const randomNumber = Math.floor(Math.random() * 10) + 1;
  if(randomNumber >= 5){
    option = faker.address.country();
  }else{
    option = faker.address.city();
  }
  return option;
}
async function getRadioInfo(code){
  const base_api_info = `${base_api}ara/content/channel/${code}`
  const response = await axios.get(base_api_info);
  return response;
}