module.exports = {
  name: 'scan',
  aliases: ['escanear'],
  description: 'Escanea una imagen en busca de texto.',
  args: true,
  execute(message) {
    const download = require('image-downloader');

    async function quickstart() {
      // Imports the Google Cloud client library
      const vision = require('@google-cloud/vision');
      const credentials = require('../../credentials-google.json');
      const { DH_UNABLE_TO_CHECK_GENERATOR } = require('constants');
      const { url } = require('inspector');
      const { load } = require('dotenv');

      // Creates a client for API Vision
      const clientVision = new vision.ImageAnnotatorClient({
        credentials,
      });

      // Embeds for scanning status (SUCCESS / FAILED)
      const Discord = require('discord.js');
      const embedOCR_success = new Discord.MessageEmbed()
        .setTitle('¡Escaneo completado!')
        .setColor('#32a852');
      const embedOCR_failed = new Discord.MessageEmbed()
        .setTitle('Escaneo fallido')
        .setColor('#ed4245');

      // checks if an attachment is sent
      if (message.attachments.first()) {
        url_image = message.attachments.first().url;
        const options = {
          url: url_image,
          dest: './',
        };
        await download
          .image(options)
          .then(({ filename }) => {
            console.log('Saved to', filename);
          })
          .catch((err) => console.error(err));
      }

      // Performs label detection on the image file
      const path = './unknown.png';
      let text;
      let textLenght;
      try {
        const [result] = await clientVision.textDetection('./unknown.png');
        const annotation = result.textAnnotations[0];
        text = annotation ? annotation.description : '';
        textLenght = text.length;
      } catch (error) {
        embedOCR_failed.setDescription('No se ha encontrado ninguna imagen.');
        message.channel.send({ embeds: [embedOCR_failed] });
      }

      // Delete image stored locally after scanning
      const fs = require('fs');
      fs.unlink(path, (err) => {
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
        message.channel.send({ embeds: [embedOCR_success] });
      }
    }

    quickstart();
  },
};
