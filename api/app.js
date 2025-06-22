const path = require("path");
const { log } = require("./src/utils/colorLogging");

const isDev = process.argv.includes("--dev");

if (!isDev && process.env.EMAIL && process.env.DOMAIN) {
  require("./src/main-ssl");
} else {
  require("./src/main");
}
