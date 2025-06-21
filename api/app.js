const path                        = require('path');
const express                     = require('express');
const http                        = require('http');
const setupWebsockets             = require('./src/controllers/websocket');
const setupRest                   = require('./src/controllers/rest');
const database                    = require('./src/database');
const { log }                     = require('./src/utils/colorLogging');

// Load environment variables from .env file
const dotenvPath = path.join(__dirname, 'environments', '.env');
require('dotenv').config({ path: dotenvPath });

const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);

// Initialize database connection and start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await database.connect();
    
    // Set up controllers
    setupWebsockets(server);
    setupRest(app);

    // Start server
    server.listen(PORT, () => {
      log.success('server', `Server running on port ${PORT}`);
    });
  } catch (error) {
    log.error('server', `Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  log.info('server', 'Shutting down server...');
  await database.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  log.info('server', 'Shutting down server...');
  await database.disconnect();
  process.exit(0);
});

startServer();

