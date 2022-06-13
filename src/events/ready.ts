import { Event } from "../structures/Event";
import { connect } from "mongoose";

import { ExtendedClient } from "../structures/Client";
export const client = new ExtendedClient();
const { MessageEmbed } = require('discord.js');

export default new Event("ready", () => {
    console.log("Bot online!");
    //connectDatabase();

});

export const connectDatabase = async () => {
    await connect(process.env.MONGOURI);
    console.log("Database connected!")
}