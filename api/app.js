const express                     = require('express');
const http                        = require('http');
const setupWebsockets             = require('./src/controllers/websocket');
const setupRest                   = require('./src/controllers/rest');
const { PORT }                    = require('./conf');

const app = express();
const server = http.createServer(app);

// Set up controllers
setupWebsockets(server);
setupRest(app);

// Inicializa o servidor
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

