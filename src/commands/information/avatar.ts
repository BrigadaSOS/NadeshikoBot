import { Command } from "../../structures/Command";
const { MessageEmbed } = require('discord.js');

export default new Command({
    name: 'avatar',
	description: 'Obtiene el avatar del usuario mencionado o el tuyo.',
    options: [
        {
        name: 'usuario',
        description: '¡Menciona un usuario!',
        type: 'MENTIONABLE',
        required: false,
        },
    ],
    run: async ({ interaction, client }) => {
        const embed = new MessageEmbed()
            .setTitle('Avatar')
            .setColor('eb868f');

        let user = null
        try {
            user = interaction.options.get('usuario').value;
        } catch (error) {
            
        }

        if(user === null) {
          embed.setImage(interaction.user.displayAvatarURL({ dynamic: true, size: 1024 }));
          interaction.editReply({ embeds: [embed] });
    
        }else{
            const memberMention = user.toString()
            const id_user = memberMention.replace(/\D/g, '');
            const user_object = await client.users.fetch(id_user);
          embed.setImage(user_object.displayAvatarURL({ dynamic: true, size: 1024 }));
          interaction.editReply({ embeds: [embed] });
        }
    }
});