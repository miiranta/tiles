const express                     = require('express');
const http                        = require('http');
const path                        = require('path');
const { Database }                = require('./infrastructure/database');

// Carrega as variáveis de ambiente
const dotenvpath = path.join(__dirname, './../../conf/.env');
require('dotenv').config({ path: dotenvpath });

// Inicia a conexão com o banco de dados
const database = new Database(process.env.MONGO_CONNECTION_STRING);

// Cria os objetos express e http
const app = express();
const server = http.createServer(app);

// Inicializa o servidor express
server.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}.`);
});
