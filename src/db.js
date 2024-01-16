const sqlite = require("better-sqlite3");
const { DATABASE_PATH } = require("./bot-config");

// open database in memory
const db = new sqlite(DATABASE_PATH);

module.exports = { db };
