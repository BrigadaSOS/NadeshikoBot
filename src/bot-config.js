require("dotenv").config();

const {
  TOKEN,
  CLIENT_ID,
  TEST_GUILD_ID,
  OWNER_ID,
  NADEDB_API_KEY,
  JPDB_API_KEY,
  DATABASE_PATH,
  TESTER_ROLE,
} = process.env;

module.exports = {
  TOKEN,
  CLIENT_ID,
  TEST_GUILD_ID,
  OWNER_ID,
  NADEDB_API_KEY,
  JPDB_API_KEY,
  DATABASE_PATH,
  TESTER_ROLE,
};
