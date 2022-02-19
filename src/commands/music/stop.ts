import { Command } from "../../structures/Command";
const { distube } = require('./play.ts')

export default new Command({
    name: 'stop',
	description: 'Detiene una queue.',
    run: async ({ interaction, client }) => {
        let queue = distube.getQueue(interaction.guildId);
        try {
            distube.stop(queue)
        } catch (error) {
            return interaction.editReply('No hay nada que detener.')
        }
        interaction.editReply('Se ha detenido la queue.')
    }
});