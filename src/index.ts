require("dotenv").config();

console.log(process.env.bot_token)

import { ExtendedClient } from "./structures/Client";

export const client = new ExtendedClient();

client.start();
