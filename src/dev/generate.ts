/*
import { Command } from "../../structures/Command";
const { MessageEmbed } = require('discord.js');
import { LogModel } from '../../models/log';
var faker = require('community-faker');

export default new Command({
    name: 'generatedata',
	description: 'Obtiene el avatar del usuario mencionado o el tuyo.',
    run: async ({ interaction, client }) => {

        for (let index = 0; index < 100; index++) {

            const type = ['ANIME', 'VN', 'BOOK', 'READINGTIME', 'MANGA', 'LISTENING', 'READING']
            const data = {
                discord_guild_id: 795683075212312636,
                discord_user_id: Math.floor(Math.random() * 20) + 1,
                type_activity: type[Math.floor(Math.random()*type.length)],
                create_at:  randomDate(new Date(2020, 0, 1), new Date(2023,0,1)),
                amount: Math.floor(Math.random() * 500) + 1,
                details: faker.lorem.sentence()
            };

            await LogModel.create(data);
        }
    }
})


function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

*/