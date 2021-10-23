const { glob } = require('glob');
const { promisify } = require('util');
const globPromise = promisify(glob);

module.exports = async (client) => {
    // Commands
    const commandFiles = await globPromise(`${process.cwd()}/commands/**/*.js`);
    commandFiles.map((value) => {
        const file = require(value);
        const splitted = value.split('/');
        const directory = splitted[splitted.length - 2];

        if (file.name) {
            const properties = { directory, ...file };
            client.commands.set(file.name, properties);
        }
    });

    // Events
    const eventFiles = await globPromise(`${process.cwd()}/events/*.js`);
    eventFiles.map((value) => require(value));

    // Slash Commands
    const slashCommands = await globPromise(`${process.cwd()}/slash_commands/*/*.js`);
    
    const arrayOfSlashCommands = [];
    slashCommands.map((value) => {
        const file = require(value);
        if(!file?.name) return;
        client.slashCommands.set(file.name, file);
        if(['MESSAGE', 'USER'].includes(file.type)) delete file.description;
        arrayOfSlashCommands.push(file);
    });

    client.on('ready', async () =>{        
        await client.guilds.cache
            .get('861638009769426944')
            .commands.set(arrayOfSlashCommands);
        
        await client.guilds.cache
            .get('795683075212312636')
            .commands.set(arrayOfSlashCommands);
    });
};