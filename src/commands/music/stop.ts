import { Command } from "../../structures/Command";
const { distube } = require('./play.ts')

export default new Command({
    name: 'stop',
	description: 'Stop a queue.',
    run: async ({ interaction, client }) => {
        let queue = distube.getQueue(interaction.guildId);
        distube.stop(queue)
        interaction.editReply('Se ha detenido la queue.')
    }
});