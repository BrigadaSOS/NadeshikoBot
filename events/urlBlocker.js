const client = require('../index');

client.on('messageCreate', async (message) => {
  if (!message.guild) return;
  // if (message.member.permissions.has("MANAGE_MESSAGES")) return;

  function deleteMessage() {
    message.delete();
    message.channel.send(`¡El spam no está permitido! ${message.author}`).then(msg => {
        setTimeout(() => msg.delete(), 5000);
      });
  }

  const links = ['discord.gg/', 'discord.com/invite/'];
  const forbiddenLinks = ['discord.io/'];

  forbiddenLinks.forEach((link) => {
    if(message.content.includes(link)) return deleteMessage();
  });

  for (const link of links) {
    if (!message.content.includes(link)) return;

    const code = message.content.split(link)[1].split(' ')[0];
    const isGuildInvite = message.guild.invites.cache.has(code);

    if (!isGuildInvite) {
      try {
        const vanity = await message.guild.fetchVanityData();
        if (code !== vanity?.code) return deleteMessage();
      } catch (err) {
        deleteMessage();
      }
    }
  }
});
