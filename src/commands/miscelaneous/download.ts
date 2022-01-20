import { Command } from "../../structures/Command";
const { MessageEmbed } = require('discord.js');

const fs = require('fs')
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg')
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
ffmpeg.setFfmpegPath(ffmpegPath);

export default new Command({
    name: 'download',
	description: 'Testing',
    options: [
        {
        name: 'url',
        description: 'URL!',
        type: 'STRING',
        required: true,
        },
        {
            name: 'formato',
            description: 'MP3 | MP4',
            type: 'STRING',
            required: true,
            choices: [
                {
                name: "MP4",
                value: "MP4",
                },
                {
                    name: "MP3",
                    value: "MP3",
                }
            ],
        },
        {
            name: 'start',
            description: 'Formatos permitidos: hh:mm:ss | mm:ss | ss',
            type: 'STRING',
            required: false,
        },
        {
            name: 'end',
            description: 'Formatos permitidos: hh:mm:ss | mm:ss | ss',
            type: 'STRING',
            required: false,
        },
    ],
    run: async ({ interaction, client }) => {

        let url = interaction.options.getString('url');
        let start = interaction.options.getString('start');
        let end = interaction.options.getString('end');
        let option = interaction.options.getString('formato');

        let options = null;
        const video_info = await ytdl.getInfo(url);
        let title_video = null;
        if(option === 'MP4'){
            options = {
                quality: 'highest',
            };  
            title_video = `${video_info.videoDetails.title}`.replace(/[^A-Z0-9]+/ig, '_');
            title_video = title_video + '.mp4';
        }else if(option === 'MP3'){
            options = {
                filter: 'audioonly',
                quality: 'highestaudio',
            };  
            title_video = `${video_info.videoDetails.title}`.replace(/[^A-Z0-9]+/ig, '_');
            title_video = title_video + '.mp3';
        }

        const video = await ytdl(url, options)
        const video_duration = video_info.videoDetails.lengthSeconds;

        let start_total = null;
        if(start != null) {
            start_total = 0;
            let start_array = await timeToSeconds(start);
            for(const i in start_array) { start_total += start_array[i]; }
        }else{
            start_total = 0;
        }

        let end_total = null;
        if(end != null) {
            end_total = 0;
            const end_array = await timeToSeconds(end);
            for(const x in end_array) { end_total += end_array[x]; }
        }else{
            end_total = video_duration;
        }

        if (start_total === end_total) { return interaction.editReply('Los valores de inicio y cierre no son válidos al ser iguales.'); }

        const total_crop = end_total - start_total;

        let stream = video.pipe(fs.createWriteStream(`resources/download/${title_video}`));
        stream.on('finish', () => {
            interaction.editReply('Archivo descargado. Convirtiendo...')
            ffmpeg(`resources/download/${title_video}`)
            .setStartTime(start_total)
            .setDuration(total_crop)
            .addOptions(['-crf 28','-profile:v baseline', '-fs 8000000'])
            .output(`resources/download/1_${title_video}`)
            .on('end', async function(err) {
                if(!err) { 
                    console.log('conversion Done'); 
                    await interaction.editReply('Subiendo archivo...')
                    await interaction.editReply({ files: [`resources/download/1_${title_video}`] });
                    await interaction.editReply('¡Subida finalizada!')

                }
            })
            .on('error', function(err){
                console.log('error: ', err);
            }).run()
        });

    }
});

async function timeToSeconds(time: string) {
    const time_array = time.split(':').reverse().map(x=>+x);
    const final_array = [];
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