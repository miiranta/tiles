const { Player } = require('../domain/models/playerModel');
const { log } = require('../utils/colorLogging');

class PlayerManager {
  constructor(database, statsManager, tokenManager) {
    this.database = database;
    this.statsManager = statsManager;
    this.tokenManager = tokenManager;
  }

  async createPlayer(playerName, password) {
    try {
      // Check if player already exists
      const existingPlayer = await Player.findByName(playerName);
      if (existingPlayer) {
        return { success: false, message: 'Player already exists' };
      }

      const player = new Player({ playerName });
      player.setPassword(password);
      await player.save();

      log.info('playerManager', `Player created: ${playerName}`);
      return { success: true, player };
    } catch (error) {
      log.error('playerManager', `Error creating player: ${error.message}`);
      return { success: false, message: 'Failed to create player' };
    }
  }

  async authenticatePlayer(playerName, password) {
    try {
      const player = await Player.findByName(playerName);
      
      if (!player) {
        return { success: false, message: 'Player not found' };
      }

      if (!player.validatePassword(password)) {
        return { success: false, message: 'Invalid password' };
      }

      // Update last login
      player.lastLogin = new Date();
      await player.save();      const token = this.tokenManager.generateToken(playerName);
      
      log.info('playerManager', `Player authenticated: ${playerName}`);
      return { success: true, token: token.token, player };
    } catch (error) {
      log.error('playerManager', `Error authenticating player: ${error.message}`);
      return { success: false, message: 'Authentication failed' };
    }
  }

  async getPlayer(playerName) {
    try {
      const player = await Player.findByName(playerName);
      return player;
    } catch (error) {
      log.error('playerManager', `Error getting player: ${error.message}`);
      return null;
    }
  }

  async updatePlayerPosition(playerName, x, y, previousX, previousY) {
    try {
      if (previousX !== 0 || previousY !== 0) {
        const distance = Math.sqrt(Math.pow(x - previousX, 2) + Math.pow(y - previousY, 2));
        if (this.statsManager) {
          await this.statsManager.updateDistanceTraveled(playerName, distance);
        }
      }
      return true;
    } catch (error) {
      log.error('playerManager', `Error updating player position: ${error.message}`);
      return false;
    }
  }
}

module.exports = { PlayerManager };
