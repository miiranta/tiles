const path                        = require('path');
const express                     = require('express');
const http                        = require('http');
const setupWebsockets             = require('./src/controllers/websocket');
const setupRest                   = require('./src/controllers/rest');

// Load environment variables from .env file
const dotenvPath = path.join(__dirname, 'environments', '.env');
require('dotenv').config({ path: dotenvPath });

const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);

// Set up controllers
setupWebsockets(server);
setupRest(app);

// Inicializa o servidor
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

