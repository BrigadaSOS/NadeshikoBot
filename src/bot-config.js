const fs = require("fs");
require("dotenv").config();

// Can either load env variables or use a config.json file if found
let { TOKEN } = process.env;
let { CLIENT_ID } = process.env;
let { TEST_GUILD_ID } = process.env;
let { PREFIX } = process.env;
let { OWNER_ID } = process.env;

if (fs.existsSync("./config.json")) {
  // eslint-disable-next-line global-require
  const config = require("../config.json");
  TOKEN ||= config.token;
  CLIENT_ID ||= config.client_id;
  TEST_GUILD_ID ||= config.test_guild_id;
  PREFIX ||= config.prefix;
  OWNER_ID ||= config.owner_id;
}

module.exports = {
  TOKEN,
  CLIENT_ID,
  TEST_GUILD_ID,
  PREFIX,
  OWNER_ID,
};
