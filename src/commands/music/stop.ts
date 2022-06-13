import { Command } from "../../structures/Command";

export default new Command({
    name: 'stop',
	description: 'Detiene una queue.',
    run: async ({ interaction, client }) => {
        let queue = client.distube.getQueue(interaction.guildId);
        try {
            client.distube.stop(queue)
        } catch (error) {
            return interaction.editReply('No hay nada que detener.')
        }
        interaction.editReply('Se ha detenido la queue.')
    }
});