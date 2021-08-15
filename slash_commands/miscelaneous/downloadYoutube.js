const config = require('../../config.json');
const language = config.language;
const i18n = require('i18n');
const fs = require('fs');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');

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

    options = {
      filter: 'audioonly',
      quality: 'highestaudio',
      opusEncoded: true,
      isHLS: true,
    };

    url = interaction.options.getString('url');
    // format = interaction.options.getString('format');
    start_time = interaction.options.getString('start-time');
    end_time = interaction.options.getString('end-time');

    if (url == null) {
      return interaction.editReply('No se ha insertado ningún link.');
    }

    yt = ytdl(args[0], options);
    const video_info = await ytdl.getInfo(args[0]);

    if(start_time != null) {
      start_total = 0; 
      start_array = await convertTimeToSeconds(start_time);
      for(const i in start_array) { start_total += start_array[i]; }
    }else{
      start_total = 0;
    }

    if(end_time != null) {
      end_total = 0;
      end_array = await convertTimeToSeconds(end_time);
      for(const x in end_array) { end_total += end_array[x]; }
    }else{
      end_total = video_info.videoDetails.lengthSeconds;
    }
    duration_crop = end_total - start_total;

    const title = `${video_info.videoDetails.title}_.mp3`.split(' ').join('_');
 

    outStream = fs.createWriteStream(`resources/${title}`);
    ffmpeg().input(yt)
    .format('mp3')
    .seekInput(start_total)
    .duration(duration_crop)
    .on('end', () => {
      interaction.editReply({ files: [`resources/${title}`] }); 
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