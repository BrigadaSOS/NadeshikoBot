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

        user = interaction.options.get('user').value;
        id_user = user.replace(/\D/g, '');

        axios.get(`https://discord.com/api/users/${id_user}`, {
            headers: {
                Authorization: `Bot ${client.token}`,
            },
        })
        .then((res) =>{
            const { banner, banner_color } = res.data;
            console.log(res);
            if(banner) {
                const extension = banner.startsWith('a_') ? '.gif' : '.png';
                const url = `https://cdn.discordapp.com/banners/${id_user}/${banner}${extension}?size=1024`;
                
                const embed = new MessageEmbed()
                    .setDescription('')
                    .setImage(url);

                interaction.editReply({ embeds: [embed] });
            }else if(!banner_color) {
                    const embed = new MessageEmbed()
                    .setDescription(`El usuario no cuenta con ningún banner. Color: ${banner_color}`)
                    .setColor(banner_color);
                    interaction.editReply({ embeds: [embed] });
                }else{
                    const embed = new MessageEmbed()
                    .setDescription(`El usuario no cuenta con ningún banner. Color de Banner: ${banner_color}`)
                    .setColor(banner_color);
                    interaction.editReply({ embeds: [embed] });
                }
        });
    },
};