const config = require("../../config.json");
const language = config.language;
const i18n = require("i18n");

module.exports = {
  name: "download",
  description: "Download a video from Youtube",
  options: [
    {
    name: "url",
    description: "URL Video from Youtube.",
    type: "STRING",
    required: true,
    },
  ],
  run: async(client, interaction, args) =>{
    // Setting the language of the command
    i18n.setLocale(language);

    const ytdl = require("ytdl-core");
    const fs = require("fs");

    options = {
      filter: "audioonly",
      quality: "highestaudio",
      opusEncoded: true,
      isHLS: true
    };
    if (args[0] == null)
      return interaction.editReply("No se ha insertado ningún link.");


    yt = ytdl(args[0], options);
    const video_info = await ytdl.getInfo(args[0]);

    const title = video_info.videoDetails.title;
    await yt.pipe(fs.createWriteStream(title+'_.mp3'));
    yt.on("finish", async () => {
      await interaction.editReply({ files: [title+"_.mp3"] });

      fs.unlink(title+"_.mp3", function (err) {
        if (err) return console.log(err);
        console.log("file deleted successfully");
      });
    });
  },
};
