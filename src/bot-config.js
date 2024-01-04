const fs = require("fs");
const config = require("../config.json");
require("dotenv").config();

// Can either load env variables or use a config.json file if found
let {
  TOKEN,
  CLIENT_ID,
  TEST_GUILD_ID,
  OWNER_ID,
  NADEDB_API_KEY,
  DATABASE_PATH,
  TESTER_ROLE,
} = process.env;

if (fs.existsSync("./config.json")) {
  // eslint-disable-next-line global-require
  const config = require("../config.json");
  TOKEN ||= config.token;
  CLIENT_ID ||= config.client_id;
  TEST_GUILD_ID ||= config.test_guild_id;
  OWNER_ID ||= config.owner_id;
  NADEDB_API_KEY ||= config.nadedb_api_key;
  DATABASE_PATH ||= config.database_path;
  TESTER_ROLE ||= config.tester_role;
}

module.exports = {
  TOKEN,
  CLIENT_ID,
  TEST_GUILD_ID,
  OWNER_ID,
  NADEDB_API_KEY,
  DATABASE_PATH,
  TESTER_ROLE,
};
