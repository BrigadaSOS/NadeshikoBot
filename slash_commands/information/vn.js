const Discord = require('discord.js');

const deepl = require('../../utilities/deepPuppeter');
const deepApi = require('../../utilities/deepAPI');

const VNDB = require('vndb-api');
const vndb = new VNDB('clientname', {
	minConnection: 1,
	maxConnection: 10,
});

errors = [];
const languages = ['es', 'en', 'ja'];

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
            description: 'Spanish (ES), English (EN), Japanese (JA)',
			type: 'STRING',
			required: false,
		},
	],
	run: async (client, interaction, args) => {
		vn_input = interaction.options.getString('name');
		lang_input = interaction.options.getString('language');

		async function searchRandomVN(search_value) {
			return vndb.query(`get vn basic,details,stats,relations,screens (id = ${search_value})`);
		}
		
		if(vn_input === '0') {
			response_random = await vndb.query('dbstats');
			search_value = (Math.random() * (response_random.vn - 1 + 1)) << 0;
			response = await searchRandomVN(search_value);
			while(response.items.length === 0) {
				search_value = (Math.random() * (response_random.vn - 1 + 1)) << 0;
				response = await searchRandomVN(search_value);
			}
		}else{
			search_value = args[0];
			response = await vndb.query(`get vn basic,details,stats,relations,screens (title ~ "${search_value}" or original ~ "${search_value}")`);
			if(response.items.length === 0) {
				response = await vndb.query(`get vn basic,details,stats,relations,screens (search ~ "${search_value}" or original ~ "${search_value}")`);
				if(response.items.length === 0) {
					return interaction.editReply('No se han encontrado resultados.');
				}
			}
		}

		console.log(response);

		try {
			release_response = await vndb.query(`get release basic,details,producers (vn = ${response.items[0].id})`).catch(error => {console.log(error); });
			description = response.items[0].description;

		} catch (error) {
			errors.push(error);
		}

	
		if(!description) {
			description = '';
		}else{
			while (description.match(/(\n){2}\[.+\]\]/)) description = description.replace(description.match(/(\n){2}\[.+\]\]/)[0], '');
			while (description.match(/(\n){2}\[.+\]/)) description = description.replace(description.match(/(\n){2}\[.+\]/)[0], '');
			while (description.match(/\[.+?]/)) description = description.replace(description.match(/\[.+?]/)[0], '');
		}


		if(lang_input != null) {
			try {
				if(languages.includes(lang_input.toLowerCase())) {
					response_deepl = await deepApi.translateDeepApi(description, lang_input);
					description = response_deepl.data.translations[0].text;
				}else{
					return interaction.editReply('Lenguaje no válido.');
				}

			} catch (error) {
				errors.push(error);
				try {
					description = await deepl.translateService(description);
				} catch (error) {
					errors.push(error);
					description = 'No ha sido posible traducir el mensaje.';
				}
			}
		}

		let title_related = '';
		try {
			for (let i = 0; i < response.items[0].relations.length; i++) {
				if (response.items[0].relations[i].relation === 'alt' ||
					response.items[0].relations[i].relation === 'side' ||
					response.items[0].relations[i].relation === 'preq' ||
					response.items[0].relations[i].relation === 'fan' ||
					response.items[0].relations[i].relation === 'seq') {
					title_related += `[${response.items[0].relations[i].title}](https://vndb.org/v${response.items[0].relations[i].id})\n`;
				}
			}
		} catch (error) {
			errors.push(error);
		}


		try {
			developer = release_response.items[0].producers[0].name;
		} catch (error) {
			errors.push(error);
			developer = 'No disponible';
		}
		
		nsfw_check = null;

		try {
			amount_screens = Object.keys(response.items[0].screens).length;
			index_screens = (Math.random() * (amount_screens - 1 + 1)) << 0;
			choosen_image = response.items[0].screens[index_screens].image;
			nsfw_check = response.items[0].screens[index_screens].nsfw;
			console.log(response.items[0].screens[index_screens]);
		} catch (error) {
			errors.push(error);
			choosen_image = '';		
		}

		// Checker NSFW
		if (interaction.channel.nsfw) {
			image_cover = response.items[0].image;
		}else{
			if(response.items[0].image_nsfw === true) {
				image_cover = 'https://media.discordapp.net/attachments/862009318168723517/871577382241308702/God_the_Father.png';
			}else{
				image_cover = response.items[0].image;
			}
			if(nsfw_check === true || nsfw_check === null) {
				choosen_image = '';
			}
		}
		
		// eslint-disable-next-line prefer-const
		let embed = new Discord.MessageEmbed()
            .setColor('eb868f')
			.setAuthor('VNDB', '', 'https://vndb.org/')
			.setImage(choosen_image)
			.setURL('https://vndb.org/v' + response.items[0].id)
			.setTitle(response.items[0].title ? response.items[0].title : 'No disponible')
			.setDescription(description === undefined ? 'No disponible' : '' + description)
			.setThumbnail(image_cover)
			.addFields(
				{ name: '❯ Titulo original', value: response.items[0].original ? response.items[0].original : 'No disponible', inline: true },
				{ name: '❯ Lanzamiento', value: response.items[0].released, inline: true },
				{ name: '❯ Desarrollador', value: developer != null ? '' + developer : 'No disponible', inline: true },
				{ name: '❯ Duración', value: duration[response.items[0].length] ? duration[response.items[0].length] : 'No disponible', inline: true },
				{ name: '❯ Puntaje', value: `${response.items[0].rating}  (Votos: ${response.items[0].votecount})`, inline: true },
				{ name: '❯ Popularidad', value: `${response.items[0].popularity}`, inline: true },
				{ name: '❯ Relacionado', value: '' + title_related || 'Ninguna' },
			);

		interaction.editReply({ embeds: [embed] });
	},
};
