module.exports = {
    name: "ping",
    description: "Show current ping Nadeshiko.",
    aliases: [],
    permissions: [],
    args: false,
    execute(message, args, client) {
      message.channel.send('Cargando información...').then (async (msg) =>{
        msg.delete()
        message.channel.send(`Latencia: ${msg.createdTimestamp - message.createdTimestamp}ms.\nLatencia API: ${Math.round(client.ws.ping)}ms.`);
      });
    },
  };
  