const config = require('../../config.json');
const language = config.language;
const error_color = config.error_color;
const i18n = require('i18n');
const fs = require('fs');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const delay = ms => new Promise(res => setTimeout(res, ms));
const { MessageEmbed } = require('discord.js');

options = {
  filter: 'audioonly',
  quality: 'highestaudio',
  opusEncoded: true,
  isHLS: true,
};

module.exports = {
  name: 'download',
  description: 'Download a video from Youtube',
  options: [
    {
    name: 'url',
    description: 'URL Video from Youtube.',
    type: 'STRING',
    required: true,
    },
    {
      name: 'start-time',
      description: 'Formatos permitidos: hh:mm:ss | mm:ss | ss',
      type: 'STRING',
      required: false,
    },
    {
      name: 'end-time',
      description: 'Formatos permitidos: hh:mm:ss | mm:ss | ss',
      type: 'STRING',
      required: false,
    },
  ],
  
  run: async (client, interaction, args) =>{
    // Setting the language of the command
    i18n.setLocale(language);

    url = interaction.options.getString('url');
    start_time = interaction.options.getString('start-time');
    end_time = interaction.options.getString('end-time');

    const embed = new MessageEmbed()
    .setTitle('Error')
    .setColor(error_color);

    try {
      if(isLetter(start_time) === true || isLetter(end_time) === true) { 
        embed.setDescription('El rango contiene caracteres no válidos.');
        return interaction.editReply({ embeds: [embed] });
      }
    } catch (error) {
      // Pass
    }


    yt = ytdl(args[0], options);
    error = null;
    yt.on('error', (err) => {
      console.log(err);
      return error = true;
    });
    await delay(100);

    if(error === true) { 
      embed.setDescription('No se han encontrado resultados.');
      return interaction.editReply({ embeds: [embed] });
    }
    
    const video_info = await ytdl.getInfo(args[0]);
    let title = `${video_info.videoDetails.title}`.replace(/[^A-Z0-9]+/ig, '_');
    title = title += '_.mp3';

    if(start_time != null) {
      start_total = 0; 
      start_array = await convertTimeToSeconds(start_time);
      for(const i in start_array) { start_total += start_array[i]; }
    }else{
      start_total = 0;
    }

    video_total = video_info.videoDetails.lengthSeconds;

    if(end_time != null) {
      end_total = 0;
      end_array = await convertTimeToSeconds(end_time);
      for(const x in end_array) { end_total += end_array[x]; }
    }else{
      end_total = video_total;
    }
    if (start_total < 0 || start_total > end_total) { return interaction.editReply('El valor de inicio no es válido.'); }
    if (end_total > video_total || end_total <= 0) { return interaction.editReply('El valor de cierre no es válido.'); }
    if (start_total === end_total) { return interaction.editReply('Los valores de inicio y cierre no son válidos al ser iguales.'); }
    duration_crop = end_total - start_total;

    outStream = fs.createWriteStream(`resources/${title}`);
    ffmpeg().input(yt)
    .format('mp3')
    .seekInput(start_total)
    .duration(duration_crop)
    .outputOptions('-fs 8380000')
    .on('progress', function(progress) {
      console.log('Processing: ' + progress.timemark);
    })
    .on('end', async () => {
      console.log('Finished');
      await interaction.editReply({ files: [`resources/${title}`] }); 
      return fs.unlinkSync(`resources/${title}`, function(err) {
        if (err) return console.log(err);
        console.log('file deleted successfully');
      });
    })
    .pipe(outStream);
  },
};

async function convertTimeToSeconds(time) {
  time_array = time.split(':').reverse().map(x=>+x);
  final_array = [];
  if(time_array.length === 1) {
    final_array.push(time_array[0]);
  } else if(time_array.length === 2) {
    if(time_array[0] >= 60 || time_array[1] >= 60) {
      console.log('Error');
    }else{
      time_array[1] = (time_array[1] * 60);
      final_array.push.apply(final_array, time_array);
    }
  } else if (time_array.length === 3) {
    if(time_array[0] >= 60 || time_array[1] >= 60 || time_array[2] < 0) {
      console.log('Error');
    }else{
      time_array[1] = (time_array[1] * 60);
      time_array[2] = (time_array[2] * 3600);
      final_array.push.apply(final_array, time_array);
    }
  }

  final_array.reverse();
  return final_array;
}

function isLetter(c) {
  return c.toLowerCase() != c.toUpperCase();
}