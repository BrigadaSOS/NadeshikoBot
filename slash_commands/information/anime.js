const { stripIndents } = require('common-tags');
const { cleanAnilistHTML } = require('../../utilities/util');

const Discord = require('discord.js');
const deepl = require('../../utilities/deepPuppeter');
const deepApi = require('../../utilities/deepAPI');

const searchGraphQL = stripIndents`
	query ($search: String, $type: MediaType, $isAdult: Boolean) {
		anime: Page (perPage: 10) {
			results: media (type: $type, isAdult: $isAdult, search: $search) {
				id
				title {
					english
					romaji
				}
			}
		}
	}
`;

const resultGraphQL = stripIndents`
query media($id: Int, $type: MediaType) {
    Media(id: $id, type: $type) {
        id
        idMal
        title {
            english
            romaji
        }
        coverImage {
            large
            medium
        }
        startDate { year }
        description(asHtml: false)
        season
        type
        siteUrl
        status
        episodes
        isAdult
        meanScore
        averageScore
        externalLinks {
            url
            site
        }
    }
}
`;

const seasons = {
	WINTER: 'Invierno',
	SPRING: 'Primavera',
	SUMMER: 'Verano',
	FALL: 'Otoño',
};

const statuses = {
	FINISHED: 'Finalizado',
	RELEASING: 'En progreso',
	NOT_YET_RELEASED: 'Sin estreno',
	CANCELLED: 'Cancelado',
};

const axios = require('axios');

module.exports = {
    name: 'anime',
    description: 'Searches AniList for your query, getting anime results',
    args: true,
    options: [
      {
      name: 'name',
      description: 'What anime would you like to search for?',
      type: 'STRING',
      required: true,
      },
      {
        name: 'language',
        description: 'spanish, english',
        type: 'STRING',
        required: false,
    },
    ],
    run: async (client, interaction, args) =>{
        const id = await searchAnime(args[0]);
        if (!id) return interaction.editReply('No ha sido posible encontrar resultados.');
        const anime = await fetchAnime(id);
        let description = anime.description;
        language = interaction.options.getString('language');

        if(language != null) {
			try {
				response_deepl = await deepApi.translateDeepApi(description);
				description = response_deepl.data.translations[0].text;
			} catch (error) {
				console.log(error);
				try {
					description = await deepl.translateService(description);
				} catch (error) {
					console.log(error);
					description = 'No ha sido posible traducir el mensaje.';
				}
			}
		}
        const embed = new Discord.MessageEmbed()
				.setColor('e791d0')
				.setAuthor('AniList', 'https://i.imgur.com/iUIRC7v.png', 'https://anilist.co/')
				.setURL(anime.siteUrl)
				.setThumbnail(anime.coverImage.large || anime.coverImage.medium || null)
				.setTitle(anime.title.english || anime.title.romaji)
				.setDescription(description ? '' + cleanAnilistHTML(description) : 'No disponible')
				.addField('❯ Estado', statuses[anime.status], true)
				.addField('❯ Episodios', '' + anime.episodes || '???', true)
				.addField('❯ Temporada', anime.season ? `${seasons[anime.season]} ${anime.startDate.year}` : 'No disponible', true)
				.addField('❯ Puntaje promedio', anime.averageScore ? `${anime.averageScore}%` : 'No disponible', true)
				.addField('❯ Links externos', anime.externalLinks.length
					? anime.externalLinks.map(link => `[${link.site}](${link.url})`).join(', ')
					: 'None', true);

      interaction.editReply({ embeds: [embed] });
    },
};

async function searchAnime(query) {
    const body = await axios.post('https://graphql.anilist.co',
    {
        query: searchGraphQL,
        variables: {
            search: query,
            type: 'ANIME',
        },
      }).catch((err) => console.log(err.message));
      if (!body.data.data.anime.results.length) return null;
      if (!body.data.data.anime) return null;
      return body.data.data.anime.results[0].id;
}

async function fetchAnime(id) {
    const body = await axios.post('https://graphql.anilist.co',
        {
            variables: {
                id,
                type: 'ANIME',
            },
            query: resultGraphQL,
        });
    return body.data.data.Media;
}

