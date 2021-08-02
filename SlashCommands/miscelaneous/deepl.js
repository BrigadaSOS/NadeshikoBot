module.exports = {
    name: "deepl",
    description: "Download a video from Youtube",
    options: [
      {
      name: "deepl",
      description: "Translate something.",
      type: "STRING",
      required: true,
      },
    ],
    run: async(client, interaction, args) =>{
        const puppeteer = require('puppeteer');

        url = 'https://www.deepl.com/translator';
        

        (async () => {
            const browser = await puppeteer.launch({ headless: true }); // default is true
            const page = await browser.newPage();
            await page.goto('https://www.deepl.com/translator');
            
            let sleepMs = ms => new Promise( r => setTimeout(r, ms));
            const defaultDelay = 1;

            const waitForTranslation = async () => {
                await sleepMs(300)
                await page.waitForSelector('.lmt:not(.lmt--active_translation_request)')
                await sleepMs(300)
            }

            // Get selectors from both squares
            await page.waitForSelector('.lmt__language_select--target .lmt__language_select__active')

            await page.click('.lmt__source_textarea')
            await sleepMs(defaultDelay)
            await page.keyboard.type(args[0])
            await waitForTranslation()
            
            const result = await page.evaluate(() => {
                const node = document.querySelector('.lmt__target_textarea')
                if (!node) return ''
                return node.value
              })
              await page.close()
              interaction.editReply(result)
              return result

          })();

    },
}