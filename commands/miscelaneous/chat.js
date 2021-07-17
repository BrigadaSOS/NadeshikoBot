const config = require('../../config.json');
const language = config.language;
const i18n = require("i18n");

// Open AI
const OpenAI = require('openai-api');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const openai = new OpenAI(OPENAI_API_KEY);

module.exports = {
  name: "chat",
  description: "",
  aliases: [],
  permissions: [],
  args: false,
  execute(message, args) {
    // Setting the language of the command 
    i18n.setLocale(language);
    (async () => {
        string_text_user = args.join(' ')
        const gptResponse = await openai.complete({
            engine: 'davinci',
            prompt: "Nadeshiko is a sarcastic chatbot.\n"+"User: "+string_text_user+"\nNadeshiko: ",
            maxTokens: 150,
            temperature: 0.9,
            topP: 1,
            presencePenalty: 0.6,
            frequencyPenalty: 0,
            bestOf: 1,
            n: 1,
            stream: false,
            echo: false,
            stop: ['\n','User:','Marv:']
        });
        
        console.log(gptResponse.data);

        answer_text = gptResponse.data.choices[0].text;

        if(answer_text != ""){
            message.reply(gptResponse.data.choices[0].text)
        }else{
            message.reply("Try again.")
        }
        
    })();

  },
};

