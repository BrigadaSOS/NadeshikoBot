const {
	ActionRowBuilder,
	StringSelectMenuBuilder,
	EmbedBuilder,
	ComponentType,
	SlashCommandBuilder,
} = require("discord.js");
const axios = require("axios");

const durationNorm = {
	5: "Muy largo",
	4: "Largo",
	3: "Intermedio",
	2: "Corto",
	1: "Muy corto",
};

const langNorm = {
	de: ":flag_de: (Alemán)",
	es: ":flag_es: (Español)",
	fr: ":flag_fr: (Francés)",
	it: ":flag_it: (Italiano)",
	en: ":flag_gb: (Inglés)",
	ja: ":flag_jp: (Japonés)",
	"zh-Hans": ":flag_cn: (Chino Simplificado)",
	"zh-Hant": ":flag_cn: (Chino Tradicional)",
	ko: ":flag_kr: (Coreano)",
	"pt-br": ":flag_br: (Portugués)",
	ru: ":flag_ru: (Ruso)",
	vi: ":flag_vn: (Vietnamita)",
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName("vndb")
		.setDescription("Busca información dentro de la base de datos de VNDB.")
		.addStringOption((option) =>
			option
				.setName("categoria")
				.setDescription("¿Qué tipo de contenido deseas buscar?")
				.setRequired(true)
				.addChoices(
					{ name: "Novelas Visuales", value: "vn" },
					{ name: "Personajes", value: "character" }
				)
		)
		.addStringOption((option) =>
			option
				.setName("query")
				.setDescription("Escribe el nombre a buscar.")
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName("idioma")
				.setDescription("¿En qué idioma quieres el resultado?")
				.setRequired(false)
				.addChoices(
					{ name: "Español (por defecto)", value: "es" },
					{ name: "Ingles", value: "en" }
				)
		),
	async execute(interaction) {
		const category = interaction.options.getString("categoria");
		const query = interaction.options.getString("query");
		const language = interaction.options.getString("idioma");

		if (category === "vn") {
			response = await axios.post("https://api.vndb.org/kana/vn", {
				filters: ["search", "=", query],
				fields: "id, title",
			});

			results = response.data.results;

			showcaseTitles = [{ label: "❌ | Cerrar Buscador", value: "close" }];

			results.forEach((item) => {
				showcaseTitles.push({
					label: item.title,
					value: item.id,
				});
			});

			const row = new ActionRowBuilder().addComponents(
				new StringSelectMenuBuilder()
					.setCustomId("select_item_vn")
					.setPlaceholder("Selecciona aquí tu VN")
					.addOptions(showcaseTitles)
			);

			message = await interaction.reply({
				content: "Se han encontrado los siguientes resultados",
				components: [row],
			});

			const filter = (i) => {
				i.deferUpdate();
				return i.user.id === interaction.user.id;
			};

			const collector = message.createMessageComponentCollector({
				filter,
				componentType: ComponentType.StringSelect,
				time: 60000,
			});

			collector.on("end", (collected) => {
				console.log(`Collected ${collected.size} items`);
				return interaction.editReply({
					components: [],
				});
			});

			collector.on("collect", async (i) => {
				if (!i.user.id == interaction.user.id)
					return await interaction.reply({
						content: "No puedes responder a una interacción que no es tuya.",
						ephemeral: true,
					});

				if (i.customId === "select_item_vn") {
					if (i.values[0] === "close") {
						try {
							return await interaction.editReply({
								content: "Resultado de la busqueda",
								components: [],
							});
						} catch {
							return interaction.deleteReply();
						}
					} else {
						id = i.values[0];
						response = await axios.post("https://api.vndb.org/kana/vn", {
							filters: ["id", "=", id],
							fields:
								"title, description, votecount, image.url, alttitle, languages, released, platforms, image.sexual, length, length_minutes, rating, screenshots.url",
						});

						// Data obtained
						console.log(response.data);
						title = response.data.results[0].title;
						description = response.data.results[0].description + "\n";
						imageCover = response.data.results[0].image.url;
						originalTitle = response.data.results[0].alttitle;
						releaseDate = response.data.results[0].released;
						developer = null;
						duration = response.data.results[0].length;
						duration_avg = Math.round(
							response.data.results[0].length_minutes / 60
						);
						rating = response.data.results[0].rating;
						voteCount = response.data.results[0].votecount;
						availableLanguages = response.data.results[0].languages
							.join(", ")
							.split(", ")
							.map((item) => {
								console.log(item);
								return langNorm[item];
							})
							.toString()
							.replaceAll(",", "\n");

						console.log(availableLanguages);

						while (description.match(/(\n){2}\[.+\]\]/))
							description = description.replace(
								description.match(/(\n){2}\[.+\]\]/)[0],
								""
							);
						while (description.match(/(\n){2}\[.+\]/))
							description = description.replace(
								description.match(/(\n){2}\[.+\]/)[0],
								""
							);
						while (description.match(/\[.+?]/))
							description = description.replace(
								description.match(/\[.+?]/)[0],
								""
							);

						description += `\n**Lenguajes disponibles**\n${availableLanguages} `;

						// Sending data in embed message
						let embedVN = new EmbedBuilder()
							.setURL("https://vndb.org/" + id)
							.setTitle(title)
							.setColor("eb868f")
							.setThumbnail(imageCover)
							.setDescription(description)
							.addFields(
								{
									name: "❯ Titulo original",
									value: originalTitle ? originalTitle : "No disponible",
									inline: true,
								},
								{ name: "❯ Lanzamiento", value: releaseDate, inline: true },
								{
									name: "❯ Desarrollador",
									value: developer != null ? "" + developer : "No disponible",
									inline: true,
								},
								{
									name: "❯ Duración",
									value:
										durationNorm[duration] + ` (∼${duration_avg} horas)`
											? durationNorm[duration] + ` (∼${duration_avg} horas)`
											: "No disponible",
									inline: true,
								},
								{
									name: "❯ Calificación",
									value: `${rating}/100 de ${voteCount} votos`,
									inline: true,
								}
							);

						await interaction.editReply({
							content: "Resultado de la busqueda",
							embeds: [embedVN],
						});
					}
				}
			});
		}
	},
};
