const client = require("../index");

client.on("ready", () => {
    console.log(`${client.user.tag} is up and ready to go!`);

    client.user.setStatus("dnd");
    /*client.user.setActivity("", {
      type: "LISTENING",
    });*/

    client.guilds.cache
        .filter((g) => g.me.permissions.has("MANAGE_GUILD"))
        .forEach((g) => g.invites.fetch({ cache: true }));
});