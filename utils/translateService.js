async function translateService(text) {
	const puppeteer = require('puppeteer');

	// Options
	sourceLanguage = 'en'; // 'en' | 'de' | 'fr' | 'es' | 'pt' | 'it' | 'nl' | 'pl' | 'ru'
	targetLanguage = 'es'; // 'en-US' | 'en-GB' | 'de-DE' | 'fr-FR' | 'es-ES' | 'pt-PT' | 'pt-BR' | 'it-IT' | 'nl-NL' | 'pl-PL' | 'ru-RU' | 'ja-JA' | 'zh-ZH'
	url = `https://www.deepl.com/translator#${sourceLanguage}/${targetLanguage}/${text}`;

	const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] }); // default is true
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

	await page.goto(url);

	// const sleepMs = (ms) => new Promise((r) => setTimeout(r, ms));

	// Get selectors from both squares
	await page.waitForSelector(
		'.lmt__language_select--target .lmt__language_select__active',
	);

	// async function setSelectVal(sel, val) {
	//	page.evaluate((data) => {
	//		return document.querySelector(data.sel).value = data.val;
	//	}, { sel, val });
	// }

	// await waitForTranslation();

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
	await browser.close();
	return await result;
}

module.exports = { translateService };