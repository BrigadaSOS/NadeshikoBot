const sqlite = require("better-sqlite3");
const { DATABASE_PATH } = require("./bot-config");

// open database in memory
const db = new sqlite(DATABASE_PATH);

const query = (sql, params) => db.prepare(sql).all(params);

const run = (sql, params) => db.prepare(sql).run(params);

module.exports = { db, query, run };
