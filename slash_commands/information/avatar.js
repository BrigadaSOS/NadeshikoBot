const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'avatar',
  description: 'Get the avatar URL of the tagged user or your own avatar.',
  args: true,
  options: [
    {
    name: 'user',
    description: 'Tag any user!',
    type: 'MENTIONABLE',
    required: false,
    },
  ],
  run: async (client, interaction, args) =>{
    const embed = new MessageEmbed()
    .setTitle('Avatar')
    .setColor('eb868f');

    if(args[0] == null) {
      embed.setImage(interaction.user.displayAvatarURL({ dynamic: true, size: 1024 }));
      interaction.editReply({ embeds: [embed] });

    }else{
      memberMention = interaction.options.get('user').value;
      id_user = memberMention.replace(/\D/g, '');
      try {
        userObject = await client.users.fetch(id_user);
      } catch (error) {
        return interaction.editReply('El valor ingresado no es un usuario.');
      }
      embed.setImage(userObject.displayAvatarURL({ dynamic: true, size: 1024 }));
      interaction.editReply({ embeds: [embed] });
    }
  },
};
