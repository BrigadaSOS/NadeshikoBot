const Discord = require('discord.js');
const deepl = require('../../utilities/deepPuppeter');
const deepApi = require('../../utilities/deepAPI');

const duration = {
	5: 'Muy largo (>50 horas)',
	4: 'Largo (30 - 50 horas)',
	3: 'Intermedio (10 - 30 horas)',
	2: 'Corto (2 - 10 horas)',
	1: 'Muy corto (< 2 horas)',
};

module.exports = {
	name: 'vn',
	description: 'Get the VN info from VNDB of any input.',
	args: true,
	options: [
		{
			name: 'name',
			description: 'Search for any visual novel name! (0 = random VN)',
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
	run: async (client, interaction, args) => {
		const VNDB = require('vndb-api');
		// Create a client
		const vndb = new VNDB('clientname', {
			// optionally, override any connection options you need to here, like
			minConnection: 1,
			maxConnection: 10,
		});

		language = interaction.options.getString('language');

		if(args[0] === '0') {
			response_random = await vndb.query('dbstats');
			search_value = (Math.random() * (response_random.vn - 1 + 1)) << 0;
			response = await vndb.query(`get vn basic,details,stats,relations,screens (id = ${search_value})`);
		}else{
			search_value = args[0];
			response = await vndb.query(`get vn basic,details,stats,relations,screens
			 (search ~ "${search_value}" or original ~ "${search_value}")`);
		}

		try {
			release_response = await vndb.query(`get release basic,details,producers (vn = ${response.items[0].id})`).catch(error => {console.log(error); });
		} catch (error) {
			console.log(error);
		}

		// Use the response
		raw_description = response.items[0].description || '';
		description = raw_description.replace(/More information\r?\n?[^\r\n]*$/ || '', '');
		description = description.replace(/\[r?\n?[^\r\n]*$/ || '', '');
		description = description.replace(/\[(.*)\]/ | '', '');

	
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
		let title_related = '';
		for (let i = 0; i < response.items[0].relations.length; i++) {
			if (response.items[0].relations[i].relation === 'alt' ||
				response.items[0].relations[i].relation === 'side' ||
				response.items[0].relations[i].relation === 'preq' ||
				response.items[0].relations[i].relation === 'fan' ||
				response.items[0].relations[i].relation === 'seq') {
				title_related += `[${response.items[0].relations[i].title}](https://vndb.org/v${response.items[0].relations[i].id})\n`;
			}
		}
		// eslint-disable-next-line prefer-const
		let embed = new Discord.MessageEmbed()
			.setColor('e791d0')
			.setAuthor('VNDB', '', 'https://vndb.org/')
			.setURL('https://vndb.org/v' + response.items[0].id)
			.setTitle(response.items[0].title ? response.items[0].title : 'No disponible')
			.setDescription(description === null ? 'No disponible' : '' + description)
			.setThumbnail(response.items[0].image_nsfw === true ? 'https://media.discordapp.net/attachments/862009318168723517/871577382241308702/God_the_Father.png' : response.items[0].image)
			.addField('❯ Titulo original', response.items[0].original ? response.items[0].original : 'No disponible', true)
			.addField('❯ Fecha de lanzamiento', '' + response.items[0].released, true)
			.addField('❯ Desarrollador', release_response.items[0].producers[0].name != null ? '' + release_response.items[0].producers[0].name : 'No disponible', true)
			.addField('❯ Duración', duration[response.items[0].length] ? duration[response.items[0].length] : 'No disponible', true)
			.addField('❯ Puntaje promedio', `${response.items[0].rating}  (Votos: ${response.items[0].votecount})`, true)
			.addField('❯ Popularidad', `${response.items[0].popularity}`, true)
			.addField('❯ Relacionado', '' + title_related || 'Ninguna');

		interaction.editReply({ embeds: [embed] });
	},
};
