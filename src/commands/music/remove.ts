import { Command } from "../../structures/Command";

export default new Command({
    name: 'remove',
	description: 'Elimina una canción del queue.',
    options: [
        {
          name: "posicion",
          description: "Posición del audio a remover.",
          type: "INTEGER",
          required: true,
    }],
    run: async ({ interaction, client }) => {
        let queue = client.distube.getQueue(interaction.guildId);
        let position = interaction.options.getInteger("posicion");
        if (position > 0 && position <= queue.songs.length-1) {
            queue.songs.splice(position, 1);
            interaction.editReply('Se ha removido el audio con posición '+ position);
        }else{
            interaction.editReply('Valor no válido.')
        }
        console.log(queue.songs); 
    }
});