async function translateService(text) {
	const puppeteer = require('puppeteer');

	// Options
	sourceLanguage = 'en'; // 'en' | 'de' | 'fr' | 'es' | 'pt' | 'it' | 'nl' | 'pl' | 'ru'
	targetLanguage = 'es-ES'; // 'en-US' | 'en-GB' | 'de-DE' | 'fr-FR' | 'es-ES' | 'pt-PT' | 'pt-BR' | 'it-IT' | 'nl-NL' | 'pl-PL' | 'ru-RU' | 'ja-JA' | 'zh-ZH'
	url = 'https://www.deepl.com/translator';

	const browser = await puppeteer.launch({ headless: true }); // default is true
	const page = await browser.newPage();
	await page.setRequestInterception(true);
	page.on('request', (req) => {
		if(req.resourceType() === 'image' || req.resourceType() === 'font') {
			req.abort();
		}
		else {
			req.continue();
		}
  });

	await page.goto('https://www.deepl.com/translator');

	// const sleepMs = (ms) => new Promise((r) => setTimeout(r, ms));

	const waitForTranslation = async () => {
		await page.waitForSelector('.lmt:not(.lmt--active_translation_request)');
		// await sleepMs(5000);
	};

	// Get selectors from both squares
	await page.waitForSelector(
		'.lmt__language_select--target .lmt__language_select__active',
	);

	await page.click('.lmt__source_textarea');

	await page.click('.lmt__language_select--source .lmt__language_select__active');
	await page.click(`[dl-test=translator-source-lang-list] [dl-test="translator-lang-option-${sourceLanguage}"]`);

	await page.click('.lmt__language_select--target .lmt__language_select__active');
	await page.click(`[dl-test=translator-target-lang-list] [dl-test="translator-lang-option-${targetLanguage}"]`);


	async function setSelectVal(sel, val) {
		page.evaluate((data) => {
			return document.querySelector(data.sel).value = data.val;
		}, { sel, val });
	}

	await page.click('.lmt__source_textarea');
	await page.keyboard.type(' ');
	await setSelectVal('.lmt__source_textarea', text);
	await waitForTranslation();

  const selector = '.lmt__target_textarea';
  await page.waitForFunction(
    selector => document.querySelector(selector).value.length > 0,
    {},
    selector,
  );

	const result = await page.evaluate(() => {
		const node = document.querySelector('.lmt__target_textarea');
		if (!node) return '';
		return node.value;
	});
	await page.close();
	return await result;
}

module.exports = { translateService };