const express = require('express');
const path = require('path');
const { Tile } = require('../domain/models/tileModel');
const { COLORS } = require('../domain/enums/colors');
const { log } = require('../utils/colorLogging');

class MapController {
  constructor(app, io, mapManager, tokenManager) {
    this.app = app;
    this.io = io;
    this.mapManager = mapManager;
    this.tokenManager = tokenManager;
    this.setupRoutes();
    this.setupWebSocket();
  }

  setupRoutes() {
    const router = express.Router();    // GET /map/:x/:y/:range - Get tiles
    router.get('/map/:x/:y/:range', async (req, res) => { 
      try {
        if (!req.params.x || !req.params.y || !req.params.range) {
          return res.status(400).json({ error: 'Missing parameters' });
        }

        const x = parseInt(req.params.x);
        const y = parseInt(req.params.y);
        const range = parseInt(req.params.range);

        // Validation
        if (range > 100) {
          return res.status(400).json({ error: 'Range value too high (>100)' });
        }
        if (range < 0) {
          return res.status(400).json({ error: 'Range value too low (<0)' });
        }
        if (isNaN(x) || isNaN(y) || isNaN(range)) {
          return res.status(400).json({ error: 'Invalid coordinates or range value' });
        }

        // Get tiles from database
        const tiles = await this.mapManager.getTiles(x, y, range);
        res.json(tiles);
      } catch (error) {
        log.error('mapController', `Error fetching tiles: ${error.message}`);
        res.status(500).json({ error: 'Internal server error' });
      }
    });    this.app.use(router);
    log.info('mapController', 'Map endpoints configured');
  }

  setupWebSocket() {
    this.io.on('connection', (socket) => {
      // Tile placement via WebSocket
      socket.on('map-place', async (data) => {
        try {
          const { token, x, y, type } = data;
          
          if (!token || typeof x !== 'number' || typeof y !== 'number' || !type) {
            return;
          }

          // Verify JWT token
          const tokenInfo = this.tokenManager.verifyToken(token);
          if (!tokenInfo || !tokenInfo.valid) {
            socket.emit('auth-error', { message: 'Invalid or expired token' });
            return;
          }

          // Validate tile type
          if (!COLORS.includes(type)) {
            socket.emit('error', { message: 'Invalid tile type' });
            return;
          }                
          
          const success = await this.mapManager.placeTile(x, y, type, tokenInfo.playerName);
          
          if (success) {
            // Broadcast to all clients including sender IMMEDIATELY
            this.io.emit('map-place', { x, y, type, playerName: tokenInfo.playerName });
            log.info('mapController', `Tile placed at (${x}, ${y}) with color ${type} by ${tokenInfo.playerName}`);
          }
        } catch (error) {
          log.error('mapController', `Error placing tile: ${error.message}`);
        }
      });
    });

    log.info('mapController', 'Map WebSocket endpoints configured');
  }
}

module.exports = { MapController };
