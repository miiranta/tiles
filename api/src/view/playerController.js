const express = require('express');
const { log } = require('../utils/colorLogging');

class PlayerController {
  constructor(app, io, playerManager, tokenManager) {
    this.app = app;
    this.io = io;
    this.playerManager = playerManager;
    this.tokenManager = tokenManager;
    this.setupRoutes();
    this.setupWebSocket();
  }

  setupRoutes() {
    const router = express.Router();

    // GET /player/:playerName - Check if player name is available
    router.get('/player/:playerName', async (req, res) => {
      try {
        const { playerName } = req.params;

        if (!playerName || playerName.trim().length === 0) {
          return res.status(400).json({ error: 'Player name is required' });
        }

        const trimmedName = playerName.trim();
        
        if (trimmedName.length < 2 || trimmedName.length > 20) {
          return res.status(400).json({ 
            error: 'Player name must be between 2 and 20 characters',
            taken: true 
          });
        }        // Check if player is currently connected
        const isCurrentlyConnected = !this.tokenManager.isNameAvailable(trimmedName);
        
        // Check if player exists in database
        const existingPlayer = await this.playerManager.getPlayer(trimmedName);
        const existsInDatabase = !!existingPlayer;
        
        res.status(200).json({ 
          taken: isCurrentlyConnected,
          available: !isCurrentlyConnected && !existsInDatabase,
          existsInDatabase: existsInDatabase,
          currentlyConnected: isCurrentlyConnected
        });

      } catch (error) {
        log.error('playerController', `Error checking player name availability: ${error.message}`);
        res.status(500).json({ error: 'Internal server error', taken: true });
      }
    });

    // POST /player - Create new player with JWT token and password
    router.post('/player', async (req, res) => {
      try {
        const { playerName, password } = req.body;

        if (!playerName) {
          return res.status(400).json({ error: 'Nome de jogador é obrigatório.' });
        }

        if (playerName.trim().length < 2 || playerName.trim().length > 20) {
          return res.status(400).json({ error: 'Nomes de jogador devem ter entre 2 e 20 caracteres.' });
        }

        const trimmedName = playerName.trim();        // Check if player is currently connected
        if (!this.tokenManager.isNameAvailable(trimmedName)) {
          return res.status(409).json({ error: 'Este nome de jogador já está conectado.' });
        }

        if (password) {
          // Creating new player with password
          if (password.length < 4) {
            return res.status(400).json({ error: 'Senha deve ter pelo menos 4 caracteres.' });
          }

          const result = await this.playerManager.createPlayer(trimmedName, password);
          if (!result.success) {
            return res.status(409).json({ error: result.message });
          }

          log.success('playerController', `Player created in database: ${trimmedName}`);
        }        

        const tokenResult = this.tokenManager.generateToken(trimmedName);

        if (tokenResult.success) {
          res.status(201).json({
            success: true,
            token: tokenResult.token,
            playerName: tokenResult.playerName
          });
          log.success('playerController', `Player session created: ${tokenResult.playerName}`);
        } else {
          res.status(409).json({ error: tokenResult.message });
        }

      } catch (error) {
        log.error('playerController', `Error creating player: ${error.message}`);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // POST /player/authenticate - Authenticate existing player
    router.post('/player/authenticate', async (req, res) => {
      try {
        const { playerName, password } = req.body;

        if (!playerName || !password) {
          return res.status(400).json({ error: 'Nome de jogador e senha são obrigatórios.' });
        }

        const trimmedName = playerName.trim();        // Check if player is currently connected
        if (!this.tokenManager.isNameAvailable(trimmedName)) {
          return res.status(409).json({ error: 'Este jogador já está conectado.' });
        }

        const result = await this.playerManager.authenticatePlayer(trimmedName, password);
        
        if (!result.success) {
          const statusCode = result.message === 'Player not found' ? 404 : 401;
          return res.status(statusCode).json({ error: result.message });
        }

        res.status(200).json({
          success: true,
          token: result.token,
          playerName: result.player.playerName
        });
        log.success('playerController', `Player authenticated: ${result.player.playerName}`);
          
      } catch (error) {
        log.error('playerController', `Error authenticating player: ${error.message}`);
        res.status(500).json({ error: 'Internal server error' });
      }
    });    
    
    this.app.use(router);
    log.info('playerController', 'Player endpoints configured');
  }

  setupWebSocket() {
    this.io.on('connection', (socket) => {
      log.info('playerController', `Client connected: ${socket.id}`);

      let socketPlayerName = null;
      let lastPlayerPosition = { x: 0, y: 0 };   
      
      // Player position updates
      socket.on('player-update', async (data) => {
        try {
          const { token, x, y } = data;
          
          if (!token || typeof x !== 'number' || typeof y !== 'number') {
            return;
          }

          // Verify JWT token
          const tokenInfo = this.tokenManager.verifyToken(token);
          if (!tokenInfo || !tokenInfo.valid) {
            return;
          }

          this.playerManager.updatePlayerPosition(
            tokenInfo.playerName, 
            x, 
            y, 
            lastPlayerPosition.x, 
            lastPlayerPosition.y
          ).catch(err => {
            log.error('playerController', `Error updating player position: ${err.message}`);
          });
          
          lastPlayerPosition = { x, y };

          // Broadcast position to other clients
          socket.broadcast.emit('player-update', {
            playerName: tokenInfo.playerName,
            x,
            y
          });

        } catch (error) {
          log.error('playerController', `Error handling player update: ${error.message}`);
        }
      });

      socket.on('disconnect', () => {
        try {
          if (socketPlayerName) {
            // Revoke the token for this player
            const removedPlayerName = this.tokenManager.revokeToken(socketPlayerName);
            if (removedPlayerName) {
              // Notify all clients that this player has disconnected
              socket.broadcast.emit('player-remove', { playerName: removedPlayerName });
              log.info('playerController', `Player disconnected: ${removedPlayerName} (${socket.id})`);
            }
          } else {
            log.info('playerController', `Client disconnected: ${socket.id}`);
          }
        } catch (error) {
          log.error('playerController', `Error handling disconnect: ${error.message}`);
        }
      });
    });

    log.info('playerController', 'WebSocket endpoints configured');
  }
}

module.exports = { PlayerController };
