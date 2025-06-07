const express                     = require('express');
const http                        = require('http');
const path                        = require('path');
const cors                        = require('cors');
const { Server }                  = require('socket.io');
const { Database }                = require('./infrastructure/database');
const { GameManager }             = require('./application/gameManager');

// Carrega as variáveis de ambiente
const dotenvpath = path.join(__dirname, './../../conf/.env');
require('dotenv').config({ path: dotenvpath });

// Inicia a conexão com o banco de dados
const database = new Database(process.env.MONGO_CONNECTION_STRING);

// Express e middleware
const app = express();
app.use(express.json());
app.use(cors());

// Server e socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*'
  }
});

// Inicializa o gameManager
new GameManager(app, io, database);

// Inicializa o servidor express
server.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}.`);
});
