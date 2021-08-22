const axios = require('axios');
const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'banner',
    description: 'Get the banner URL of the tagged user or your own banner.',
    args: true,
    options: [
      {
      name: 'user',
      description: 'Tag any user!',
      type: 'MENTIONABLE',
      required: false,
      },
    ],
    run: async (client, interaction) =>{

        user = interaction.options.get('user');

        if(user === null) {
            console.log(interaction);
            id_user = interaction.user.id;
        }else{
            id_user = user.value.replace(/\D/g, '');
        }
            axios.get(`https://discord.com/api/users/${id_user}`, {
                headers: {
                    Authorization: `Bot ${client.token}`,
                },
            })
            .then((res) =>{
                const { banner, banner_color } = res.data;
                if(banner) {
                    const extension = banner.startsWith('a_') ? '.gif' : '.png';
                    const url = `https://cdn.discordapp.com/banners/${id_user}/${banner}${extension}?size=1024`;
                    
                    const embed = new MessageEmbed()
                        .setDescription('')
                        .setColor('eb868f')
                        .setTitle('Banner')
                        .setImage(url);

                    interaction.editReply({ embeds: [embed] });
                }else if(!banner_color) {
                        const embed = new MessageEmbed()
                        .setDescription('El usuario no cuenta con un banner o color personalizado.')
                        .setTitle('Banner')
                        .setColor('eb868f');
                        interaction.editReply({ embeds: [embed] });
                }else{
                        const embed = new MessageEmbed()
                        .setDescription(`El usuario no cuenta con un banner personalizado pero si un color personalizado.\nColor del Banner: ${banner_color}`)
                        .setTitle('Banner')
                        .setColor(banner_color);
                        interaction.editReply({ embeds: [embed] });
                }
            });
        
    },
};