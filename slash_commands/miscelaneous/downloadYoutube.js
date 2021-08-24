const config = require('../../config.json');
const language = config.language;
const error_color = config.error_color;
const i18n = require('i18n');
const fs = require('fs');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const delay = ms => new Promise(res => setTimeout(res, ms));
const { MessageEmbed } = require('discord.js');
const { format } = require('path');

const embed = new MessageEmbed()
.setTitle('Error')
.setColor(error_color);

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
      name: 'format',
      description: 'MP3 | MP4',
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
    i18n.setLocale(language);

    url = interaction.options.getString('url');
    start_time = interaction.options.getString('start-time');
    end_time = interaction.options.getString('end-time');
    format_file = interaction.options.getString('format');
    
    const video_info = await ytdl.getInfo(url);
    let title = '';

    if(format_file === 'mp4') {
      options = {
        quality: 'highest',
      };  
      title = `${video_info.videoDetails.title}`.replace(/[^A-Z0-9]+/ig, '_');
      title = title + '.mp4';
    }else if(format_file === 'mp3') {
      options = {
        filter: 'audioonly',
        quality: 'highestaudio',
        opusEncoded: true,
        isHLS: true,
      };  
      title = `${video_info.videoDetails.title}`.replace(/[^A-Z0-9]+/ig, '_');
      title = title + '.mp3';
    }else{
      interaction.editReply('Formato no válido.');
    }
    
    try {
      if(isLetter(start_time) === true || isLetter(end_time) === true) { 
        embed.setDescription('El rango contiene caracteres no válidos.');
        return interaction.editReply({ embeds: [embed] });
      }
    // eslint-disable-next-line no-empty
    } catch (error) {}

    async function downloadVideo() {
      // Download video or audio from YT 
      yt = ytdl(url, options);
      yt.once('response', () => {
        starttime = Date.now();
      });

      error = null;
      yt.on('error', (err) => {
        console.log(err);
        return error = true;
      });
      await delay(100);

      yt.on('progress', (chunkLength, downloaded, total) => {
        const percent = downloaded / total;
        const downloaded_minutes = (Date.now() - starttime) / 1000 / 60;
        const estimated_download_time = downloaded_minutes / percent - downloaded_minutes;
        if (estimated_download_time.toFixed(2) >= 1.5) {
          console.warn('Seems like YouTube is limiting Nadeshiko download speed, restarting the download to mitigate the problem...');
          yt.destroy();
          downloadVideo(); 
        }
      }).pipe(fs.createWriteStream(`./resources/${title}`));
    }

    await downloadVideo();

    if(error === true) { 
      embed.setDescription('No se han encontrado resultados.');
      return interaction.editReply({ embeds: [embed] });
    }
    
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

    yt.on('finish', async function() {
      console.log('Finished download!');
      if(format_file === 'mp3') {
        ff = await new ffmpeg()
        .input(`./resources/${title}`)
        .format('mp3')
        .seekInput(start_total)
        .duration(duration_crop)
        .outputOptions('-fs 8380000')
        .save(`./resources/YT_${title}`);
      }else if(format_file === 'mp4') {
        ff = await new ffmpeg()
        .input(`./resources/${title}`)
        .inputOptions([ `-ss ${start_total}`])
        .outputOptions([`-t ${duration_crop}`, '-fs 8200100'])
        .withVideoCodec('copy')
        .save(`./resources/YT_${title}`);
      }

      ff.on('progress', function(progress) {
        console.log('Processing: ' + progress.timemark);
      });

      ff.on('error', function(error) {
        console.log(error);
      });

      ff.on('end', async () => {
        console.log('Finished conversion!');
        const files = [`./resources/${title}`, `./resources/YT_${title}`];
        await interaction.editReply({ files: [`./resources/YT_${title}`] }); 
        return deleteFiles(files, function(err) {
          if (err) {
            console.log(err);
          } else {
            console.log('All files removed!');
          }
        });
      });

    });
  },
};

function deleteFiles(files, callback) {
  let i = files.length;
  files.forEach(function(filepath) {
    fs.unlink(filepath, function(err) {
      i--;
      if (err) {
        callback(err);
        return;
      } else if (i <= 0) {
        callback(null);
      }
    });
  });
}

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