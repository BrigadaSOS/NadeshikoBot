import { Event } from "../structures/Event";
import { connect } from "mongoose";

export default new Event("ready", () => {
    console.log("Bot online!");
    connectDatabase();
});

export const connectDatabase = async () => {
    await connect(process.env.MONGOURI);
    console.log("Database connected!")
}