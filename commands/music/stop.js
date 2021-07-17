const config = require('./../../config.json');
const language = config.language;
const i18n = require("i18n");

module.exports = {
  name: "template",
  description: "",
  aliases: [],
  permissions: [],
  args: false,
  execute(message, args) {
    // Setting the language of the command 
    i18n.setLocale(language);
    
  },
};

