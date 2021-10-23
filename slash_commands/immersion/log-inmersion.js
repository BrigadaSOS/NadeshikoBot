module.exports = {
	name: 'log-immersion',
	description: 'lorem ipsum.',
    options: [
        {
        name: 'tipo',
        description: 'anime | escucha | lectura | drama',
        type: 'STRING',
        required: true,
        },
        {
            name: 'contenido',
            description: 'Nombre o URL (en caso de ser escucha) del contenido.',
            type: 'STRING',
            required: true,
        },
        {
            name: 'cantidad',
            description: 'Tiempo en minutos o número de episodios (en caso de ser anime).',
            type: 'STRING',
            required: true,
        },
    ],
	run: async (client, interaction) => {
        interaction.editReply("Test");
    }
}