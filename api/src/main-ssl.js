const express = require("express");
const path = require("path");
const cors = require("cors");
const Greenlock = require("greenlock-express");
const { Server } = require("socket.io");
const { Database } = require("./infrastructure/database");
const { AppManager } = require("./application/appManager");
const { log } = require("./utils/colorLogging");
const execSync = require("child_process").execSync;

const ANGULAR_FOLDER = path.join(__dirname, "../../app/dist/tiles/browser");

require("dotenv").config({
  path: path.join(__dirname, "../environments/.env"),
});
const EMAIL = process.env.EMAIL;
const DOMAIN = process.env.DOMAIN;

if (!EMAIL || !DOMAIN) {
  console.error("EMAIL e DOMAIN devem ser definidos no arquivo .env");
  process.exit(1);
}

const startServer = async () => {
  const database = new Database();
  await database.connect();

  const app = express();
  app.use(express.json());
  app.use(cors({ origin: "*" }));

  app.use(express.static(ANGULAR_FOLDER));

  //GET /: Envia o frontend ao cliente
  app.get("*", (req, res) => {
    res.sendFile(path.join(ANGULAR_FOLDER, "index.html"));
  });

  execSync(
    `npx greenlock add --subject ${DOMAIN} --altnames ${DOMAIN}`,
    (error, stdout, stderr) => {
      if (error) {
        log.error("server", `Erro ao adicionar certificado: ${error.message}`);
        return;
      }
      log.info("server", `Certificado adicionado com sucesso: ${stdout}`);
    },
  );

  const glx = Greenlock.init({
    packageRoot: path.join(__dirname, ".."),
    configDir: path.join(__dirname, "../greenlock.d"),
    maintainerEmail: EMAIL,
    cluster: false,
    staging: false,
  });

  const server = glx.serve(app);

  const io = new Server(server, { cors: { origin: "*" } });
  new AppManager(app, io, database);

  const gracefulShutdown = async () => {
    log.info("server", "Desligando servidor...");
    await database.disconnect();
    process.exit(0);
  };

  process.on("SIGINT", gracefulShutdown);
  process.on("SIGTERM", gracefulShutdown);
};

startServer().catch((err) => {
  log.error("server", "Erro ao iniciar o servidor:", err);
  process.exit(1);
});
