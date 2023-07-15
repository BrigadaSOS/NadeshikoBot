const fs = require("fs");
require("dotenv").config();

// Can either load env variables or use a config.json file if found
let { TOKEN, CLIENT_ID, TEST_GUILD_ID, PREFIX, OWNER_ID, NADEDB_API_KEY } =
  process.env;

if (fs.existsSync("./config.json")) {
  // eslint-disable-next-line global-require
  const config = require("../config.json");
  TOKEN ||= config.token;
  CLIENT_ID ||= config.client_id;
  TEST_GUILD_ID ||= config.test_guild_id;
  PREFIX ||= config.prefix;
  OWNER_ID ||= config.owner_id;
  NADEDB_API_KEY ||= config.nadedb_api_key;
}

module.exports = {
  TOKEN,
  CLIENT_ID,
  TEST_GUILD_ID,
  PREFIX,
  OWNER_ID,
  NADEDB_API_KEY,
};
