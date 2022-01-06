import { Command } from "../../structures/Command";
const { MessageEmbed } = require('discord.js');
const { distube } = require('./play.ts')
const progressbar = require('string-progressbar');

export default new Command({
    name: 'remove',
	description: 'Elimina una canción del queue.',
    run: async ({ interaction, client }) => {
     
    }
});