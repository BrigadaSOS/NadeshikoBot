const client = require('../index');

client.on('interactionCreate', async (interaction) => {
    if (interaction.isCommand() || (interaction.isContextMenu())) {
    
    // eslint-disable-next-line no-empty-function
    await interaction.deferReply().catch(() => {});

    const cmd = client.slashCommands.get(interaction.commandName);
    if (!cmd)
        {return interaction.followUp({ content: 'Un error ha ocurrido.' });}
    
    console.log(`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction: ${interaction.commandName}.`);

    const args = [];
    interaction.options.data.map((x) => {
        args.push(x.value);
    });
        cmd.run(client, interaction, args);
    }
});

