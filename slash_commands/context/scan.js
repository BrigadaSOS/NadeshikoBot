const { MessageEmbed } = require('discord.js');
const vision = require('@google-cloud/vision');
const download = require('image-downloader');

const credentials = require('../../credentials-google.json');

module.exports = {
	name: 'Scan image',
    type: 'MESSAGE',
	run: async (client, interaction) => {
        const clientVision = new vision.ImageAnnotatorClient({
            credentials,
        });
    const message = interaction.options.getMessage('message');

    // Embeds for scanning status (SUCCESS / FAILED)
      const Discord = require('discord.js');
      const embedOCR_success = new Discord.MessageEmbed()
        .setTitle('¡Escaneo completado!')
        .setColor('#32a852');
      const embedOCR_failed = new Discord.MessageEmbed()
        .setTitle('Escaneo fallido')
        .setColor('#ed4245');
        async function quickstart() {

      // checks if an attachment is sent
      const directory = process.cwd() + '/resources';
      if (message.attachments.first()) {
        url_image = message.attachments.first().url;
        const options = {
          url: url_image,
          dest: directory,
        };

        await download
          .image(options)
          .then(({ filename }) => {
            console.log('Saved to', filename);
          })
          .catch((err) => console.error(err));
      }

      // Performs label detection on the image file
      let text;
      let textLenght;
      try {
        const [result] = await clientVision.textDetection('./resources/unknown.png');
        const annotation = result.textAnnotations[0];
        text = annotation ? annotation.description : '';
        textLenght = text.length;
      } catch (error) {
        console.log(error);
        embedOCR_failed.setDescription('No se ha encontrado ninguna imagen.');
        message.channel.send({ embeds: [embedOCR_failed] });
      }

      // Delete image stored locally after scanning
      const fs = require('fs');
      fs.unlink('./resources/unknown.png', (err) => {
        if (err) {
          // console.error(err)
          return;
        }
      });

      /* Debugging information of results
      console.log('Cantidad de caracteres: '+textLenght+'.\nTexto encontrado: '+text);
      console.log(result.error.message+'\n'+path); */

      // Assign embeds and results to show on Discord
      if (textLenght === 0) {
        embedOCR_failed.setDescription(
          'No se ha encontrado texto. Verifique la imagen e intentelo de nuevo.',
        );
        message.channel.send({ embeds: [embedOCR_failed] });
      } else if (textLenght >= 2048) {
        attachment = new Discord.MessageAttachment(
          Buffer.from(text, 'utf-8'),
          'Resultado.txt',
        );
        embedOCR_success.setDescription(
          'Al superar el limite de caracteres se ha enviado como un archivo de texto.',
        );
        message.channel.send({ embeds: [embedOCR_success] });
        message.channel.send({ files: [await attachment] });
      } else if (textLenght > 0) {
        embedOCR_success.setDescription(text);
        interaction.editReply({ embeds: [embedOCR_success] });
        // message.channel.send({ embeds: [embedOCR_success] });
      }
    }
      quickstart();
    },
};