import {
    ApplicationCommandDataResolvable,
    Client,
    ClientEvents,
    Collection
} from "discord.js";
import { CommandType } from "../typings/Command";
import { RegisterCommandsOptions } from "../typings/client";
import { Event } from "./Event";
const { MessageEmbed } = require('discord.js');

// Distube
import { DisTube } from 'distube';
import { SpotifyPlugin } from '@distube/spotify';
import { YtDlpPlugin } from '@distube/yt-dlp';
import { client } from "..";

export class ExtendedClient extends Client {
    commands: Collection<string, CommandType> = new Collection();
    distube: DisTube;

    constructor() {
        super({ intents: 32767 });
    }

    start() {
        this.registerModules();
        this.login(process.env.BOT_TOKEN);
    }
    async importFile(filePath: string) {
        return (await import(filePath))?.default;
    }

    async registerCommands({ commands, guildId }: RegisterCommandsOptions) {
        if (guildId) {
            this.guilds.cache.get(guildId)?.commands.set(commands);
            console.log(`Registering commands to ${guildId}`);
        } else {
            this.application?.commands.set(commands);
            console.log("Registering global commands");
        }
    }

    async registerModules() {
        // Commands
        const slashCommands: ApplicationCommandDataResolvable[] = [];
        const path = require('path')
        const fs = require('node:fs');

        const commandFolders = fs.readdirSync(`${__dirname}/../commands`);
        for (const folder of commandFolders) {
            const commandFiles = fs.readdirSync(`${__dirname}/../commands/${folder}`).filter(file => file.endsWith('.ts'));
            for (const file of commandFiles) {
                const command: CommandType = await this.importFile(`${__dirname}/../commands/${folder}/${file}`);
                this.commands.set(command.name, command);
                slashCommands.push(command);
            }
        }
    

        this.on("ready", () => {
            this.registerCommands({
                commands: slashCommands,
                guildId: process.env.guildId
            });

            this.distube = new DisTube(client, {
                // While playing
                leaveOnStop: false,
                leaveOnEmpty: true,
                // Emits
                emitNewSongOnly: true,
                emitAddSongWhenCreatingQueue: false,
                emitAddListWhenCreatingQueue: false,
                // Misc
                youtubeDL: false,
                // Plugins
                plugins: [
                  new YtDlpPlugin(),
                  new SpotifyPlugin({
                    emitEventsAfterFetching: true,
                  }),
                ],
              });

            this.distube.on("playSong", async (queue, song) => {
                const playEmbed = new MessageEmbed()
                .setColor('eb868f')
                .setTitle(`**Reproduciendo audio**`)
                .setDescription(`${song.name}`)
                .setThumbnail(song.thumbnail)
                .setTimestamp()
                .setURL(song.url)
                queue.textChannel.send({ embeds: [playEmbed] })  
            
            });
            
            this.distube.on("error", (channel, error) => {
            console.log(error);
            });
    
        });

        // Event

        const eventsPath = path.join(__dirname, '../events');
        const eventsFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.ts'));
 
        eventsFiles.forEach(async (filePath) => {
            const event: Event<keyof ClientEvents> = await this.importFile(
                `${__dirname}/../events/${filePath}`
            );
            this.on(event.event, event.run);
        });
    }
}