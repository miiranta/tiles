const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const { Server } = require('socket.io');
const { Database } = require('./infrastructure/database');
const { AppManager } = require('./application/appManager');
const { log } = require('./utils/colorLogging');

// Load environment variables from .env file
const dotenvPath = path.join(__dirname, '../environments', '.env');
require('dotenv').config({ path: dotenvPath });

const PORT = process.env.PORT || 3000;
const ANGULAR_FOLDER = path.join(__dirname, '../app/dist/tiles/browser');

// Initialize database connection and start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    const database = new Database();
    await database.connect();
    
    // Express and middleware
    const app = express();
    app.use(express.json());
    app.use(cors({
      origin: '*'
    }));

    // Static files
    app.use(express.static(ANGULAR_FOLDER));

    // Server and socket.io
    const server = http.createServer(app);
    const io = new Server(server, {
      cors: {
        origin: '*'
      }
    });    // Initialize the app manager (sets up all controllers)
    new AppManager(app, io, database);

    // Serve Angular app for all other routes
    app.get('/', (req, res) => {
      res.sendFile(path.join(ANGULAR_FOLDER, '/index.html'));
    });

    // Start server
    server.listen(PORT, () => {
      log.success('server', `Server running on port ${PORT}`);
    });

    // Handle graceful shutdown
    const gracefulShutdown = async () => {
      log.info('server', 'Shutting down server...');
      await database.disconnect();
      process.exit(0);
    };

    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);

  } catch (error) {
    log.error('server', `Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
