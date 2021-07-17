const config = require('./../../config.json');
const language = config.language;
const i18n = require("i18n");

module.exports = {
  name: "play",
  description: "",
  aliases: [],
  permissions: [],
  args: true,
  execute(message, args, client) {

    // Setting the language of the command 
    i18n.setLocale(language);
    
    const { createReadStream } = require('fs');
    const { join } = require('path');
    const voice = require('@discordjs/voice')
    const ytdl = require('ytdl-core-discord')


    async function connectToChannel() {

      const url = args[0];
      const channel = message.member.voice.channel;
      if (!channel) return message.reply('Debes estar en un canal de voz.');
      const player = voice.createAudioPlayer();

        const connection = voice.joinVoiceChannel({
          channelId: channel.id,
          guildId: channel.guild.id,
          adapterCreator: channel.guild.voiceAdapterCreator,
        });
  
      try {
        const resource = voice.createAudioResource(await ytdl(url), {quality: 'highestaudio', inputType: connection.Opus, inlineVolume: true });
        player.play(resource);
        connection.subscribe(player);
        await message.reply('Reproduciendo!');

      } catch (error) {
        message.reply('Video no válido.');
        console.log(error)
      }
        
    }
    try {
      connectToChannel();

    } catch (error) {
      
    }

  },
};

