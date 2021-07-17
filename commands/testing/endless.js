const config = require("./../../config.json");
const language = config.language;
const i18n = require("i18n");

module.exports = {
  name: "endless",
  description: "",
  aliases: [],
  permissions: [],
  args: false,
  execute(message, args) {
    // Setting the language of the command
    i18n.setLocale(language);

    const { remote } = require("webdriverio");

    const options = {
      capabilities: {
        browserName: "chrome",
        "goog:chromeOptions": {
          args: ["--disable-gpu", "--headless"],
        },
      },
    };

    (async () => {
      message.channel.send("Cargando bucle...").then(async (msg) => {
        const browser = await remote(options);
        await browser.url("https://endless8.moe/");

        const textVideo = await browser.$('#notice')
        console.log(await textVideo.getText())

        const video = await browser.$('#video-1-source')
        url_video = await video.getProperty('src')
        
        // await browser.saveScreenshot("./screenshot.png");
        msg.delete();
        message.channel.send("Kyon-kun Denwa! ||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​||||​|| _ _ _ _ _ _ "+url_video);
        await browser.deleteSession();
      });
    })();
  },
};
