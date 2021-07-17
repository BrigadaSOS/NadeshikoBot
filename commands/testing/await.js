const config = require("../../config.json");
const language = config.language;
const i18n = require("i18n");

module.exports = {
  name: "await",
  description: "",
  aliases: [],
  permissions: [],
  args: false,
  execute(message, args) {
    // Setting the language of the command
    i18n.setLocale(language);
    member1 = message.member;

    function run1() {
      member1.createDM().then((dm) => {
        member1.send(`${member1} Di la palabra "hola"`);
        const filter = (m) => m.author.id == message.author.id;
        dm.awaitMessages({ filter, max: 1, time: 10000, errors: ["time"] })
          .then((collected) => {
            console.log(collected.first().content.toLowerCase());
            // first (and, in this case, only) message of the collection
            if (collected.first().content.toLowerCase() == "hola") {
              member1.send("Bien.");
              return "Haruhi";
            } else {
              member1.send("Operation canceled.");
            }
          })
          .catch(() => {
            member1.send("No answer after 10 seconds, operation canceled.");
          });
      });
    }



  },
};
