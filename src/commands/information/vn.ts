import { Command } from "../../structures/Command";
const { MessageEmbed, MessageActionRow, MessageButton  } = require('discord.js');

const VNDB = require('vndb-api');
const vndb = new VNDB('clientname', {
	minConnection: 1,
	maxConnection: 10,
});

const errors = [];
const languages = ['es', 'en', 'ja'];

const deepApi = require('./../../utilities/deepAPI');

const duration = {
	5: 'Muy largo (>50 horas)',
	4: 'Largo (30 - 50 horas)',
	3: 'Intermedio (10 - 30 horas)',
	2: 'Corto (2 - 10 horas)',
	1: 'Muy corto (< 2 horas)',
};

export default new Command({
    name: 'vn',
	description: 'Obten información de una VN en VNDB.',
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
    run: async ({ interaction, client }) => {
		const vn_input = interaction.options.getString('name');
		const lang_input = interaction.options.getString('language');
        let response = null;
        let response_random = null;
        let search_value = null;


		async function searchRandomVN(search_value) {
			return vndb.query(`get vn basic,details,stats,relations,screens (id = ${search_value})`);
		}
		

		if(vn_input === '0') {
			response_random = await vndb.query('dbstats');
			search_value = (Math.random() * (response_random.vn - 1 + 1)) << 0;
			response = await searchRandomVN(search_value);
			while(response.items.length === 0) {
				const search_value = (Math.random() * (response_random.vn - 1 + 1)) << 0;
				response = await searchRandomVN(search_value);
			}
		}else{
			search_value = vn_input;
			response = await vndb.query(`get vn basic,details,stats,relations,screens (title ~ "${search_value}" or original ~ "${search_value}")`);
			if(response.items.length === 0) {
				response = await vndb.query(`get vn basic,details,stats,relations,screens (search ~ "${search_value}" or original ~ "${search_value}")`);
				if(response.items.length === 0) {
					return interaction.editReply('No se han encontrado resultados.');
				}
			}
		}

		console.log(response);

        let description = '';
        let release_response = null;

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

        let response_deepl = null;

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
				description = 'No ha sido posible traducir el mensaje.';
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


        let developer = null;
		try {
			developer = release_response.items[0].producers[0].name;
		} catch (error) {
			errors.push(error);
			developer = 'No disponible';
		}
		

        let choosen_image = null;
        let no_nsfw_images = [];
        let nsfw_images = [];
        let amount_screens = null;
        let index_screens = null;

		try {
			amount_screens = Object.keys(response.items[0].screens).length;

            for (let index = 0; index < amount_screens; index++) {
                if(!response.items[0].screens[index].nsfw){
                    no_nsfw_images.push(response.items[0].screens[index].image)
                }else{
                    nsfw_images.push(response.items[0].screens[index].image)
                }
            }
            
			console.log(no_nsfw_images);
            console.log(nsfw_images);

            
		} catch (error) {
			errors.push(error);
				
		}
        
        let image_cover = null;
        let nsfw_nonsfw_images = no_nsfw_images.concat(nsfw_images);
		let current_index_image; 
		
		// Checker NSFW
        if (interaction.channel.type == "GUILD_TEXT"){
            if (interaction.channel.nsfw) {
                image_cover = response.items[0].image;
                choosen_image = nsfw_nonsfw_images[Math.floor(Math.random()*nsfw_nonsfw_images.length)];;	
            }else{
                if(response.items[0].image_nsfw === true) {
                    image_cover = 'https://media.discordapp.net/attachments/862009318168723517/871577382241308702/God_the_Father.png';
                }else{
                    image_cover = response.items[0].image;
                }
				current_index_image= Math.floor(Math.random()*no_nsfw_images.length);
                choosen_image = no_nsfw_images[Math.floor(Math.random()*no_nsfw_images.length)];;	
            }
        }
		console.log(choosen_image);
		// eslint-disable-next-line prefer-const
		let button_left = new MessageButton()
			.setCustomId('left_vn')
			.setLabel('←')
			.setStyle('SUCCESS')
			.setDisabled(true);

		let button_right = new MessageButton()
			.setCustomId('right_vn')
			.setLabel('→')
			.setStyle('SUCCESS')

		const row = new MessageActionRow()
			.addComponents(button_left, button_right);

		let embed = new MessageEmbed()
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

		interaction.editReply({ embeds: [embed], components: [row] });


		const collector = interaction.channel.createMessageComponentCollector();

		collector.on('collect', async i => {
			
			if (i.customId === 'right_vn') {
				let amount_images = no_nsfw_images.length;
				console.log(current_index_image + ' ' + amount_images);
				
				if(current_index_image < amount_images){
					current_index_image++;
					embed.setImage(no_nsfw_images[current_index_image]);

					if(current_index_image === amount_images-1){
						button_right.setDisabled(true);
					}else{
						button_right.setDisabled(false);
					}

					if(current_index_image === 0){
						button_left.setDisabled(true);
					}else{
						button_left.setDisabled(false);
					}

					await i.update({ embeds: [embed], components: [row] });
				}
			}else if (i.customId === 'left_vn') {
				let amount_images = no_nsfw_images.length;
				console.log(current_index_image + ' ' + amount_images);

				if(current_index_image <= amount_images-1){
					current_index_image--;
					embed.setImage(no_nsfw_images[current_index_image]);

					if(current_index_image === amount_images-1){
						button_right.setDisabled(true);
					}else{
						button_right.setDisabled(false);
					}

					if(current_index_image === 1){
						button_left.setDisabled(true);
					}else{
						button_left.setDisabled(false);
					}

					await i.update({ embeds: [embed], components: [row] });

				}

			}

		});

		collector.on('end', collected => console.log(`Collected ${collected.size} items`));

    }
});

