// using different path since call to `npm migrate` is run in server directory, not root
require("dotenv").config({ path: "../.env" });
module.exports = {
  development: {
    url:
      process.env.DEV_DATABASE_URL ||
      "postgres://gor@localhost:5432/mapcreator_react_dev",
    logging: false,
    verifier_url: 'http://54.169.12.38:8000'
  },
  test: {
    url:
      process.env.TEST_DATABASE_URL ||
      "postgres://gor@localhost:5432/mapcreator_react_test",
    logging: false,
    verifier_url: 'http://54.169.12.38:8000'
  },
  production: {
    url:
      process.env.DATABASE_URL ||
      "postgres://gor@localhost:5432/mapcreator_react",
    logging: false,
    verifier_url: 'http://54.169.12.38:8000'
  }
};
