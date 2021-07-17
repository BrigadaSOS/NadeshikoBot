const config = require('./../../config.json');
const language = config.language;
const i18n = require("i18n");

module.exports = {
  name: "leave",
  description: "",
  aliases: [],
  permissions: [],
  args: false,
  async execute(message, args, client) {
    // Setting the language of the command 
    i18n.setLocale(language);
    const channel = client.channels.cache.get("796082994963546203");
    
    const voice = require('@discordjs/voice')
    const connection = voice.joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
    });
    connection.destroy();

  },
};

