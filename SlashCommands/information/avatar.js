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
    if(args[0] == null) {
      interaction.editReply(interaction.user.displayAvatarURL({ dynamic: true, size: 1024 }));
    }else{
      memberMention = interaction.options.get('user').value;
      id_user = memberMention.replace(/\D/g, '');
      try {
        userObject = await client.users.fetch(id_user);
      } catch (error) {
        return interaction.editReply('El valor ingresado no es un usuario.');
      }
      interaction.editReply(userObject.displayAvatarURL({ dynamic: true, size: 1024 }));
    }
  },
};
