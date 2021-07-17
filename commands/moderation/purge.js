module.exports = {
  name: "purge",
  description: "Purge up to 99 messages.",
  permissions: "MANAGE_MESSAGES",
  execute(message, args) {
    const amount = parseInt(args[0]) + 1;

    if (isNaN(amount)) {
      return message.reply("Número no valido.");
    } else if (amount <= 1 || amount > 100) {
      return message.reply("Rango 1 - 99.");
    }

    message.channel.bulkDelete(amount, true).catch((err) => {
      console.error(err);
      message.channel.send("Hubo un error.");
    });
  },
};
