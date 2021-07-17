module.exports = {
  name: "changePrefix",
  aliases: ["prefix"],
  description: "Change default prefix.",
  permissions: "MANAGE_SERVER",
  args: false,
  async execute(message, args) {
    messageSend(message, args);
  },
};

// Async fucntion in order to react and listen in a message
async function messageSend(message, args) {

  // Requierements
  const fs = require("fs");
  const Discord = require("discord.js");
  var configs = JSON.parse(fs.readFileSync("./config.json"));
  currentPrefix = configs["prefix"];

  // Awaiting reactions
  const agree = "✅";
  const disagree = "❌";

  // Embed for config prefix
  let embed_prefix = new Discord.MessageEmbed()
    .setTitle("Configuración Prefix")
    .setColor("#e791d0")
    .setDescription(
      `El prefix actual del servidor es: **${currentPrefix}**\n**¿Desea cambiarlo?**`
    );
    
  // Send message to the channel and react to it
  message.channel.send({ embeds: [embed_prefix] }).then((sentEmbed) => {
    sentEmbed.react(agree);
    sentEmbed.react(disagree);
  });

  
}
