const translate = require("deepl");

async function translateDeepApi(text_user) {
    try {
        response_api = await translate({
            free_api: true,
            text: text_user,
            target_lang: 'ES',
            auth_key: process.env.AUTH_DEEPL,
        });
        return response_api;
    } catch (error) {
        console.log(error);
    }
}

module.exports = { translateDeepApi };