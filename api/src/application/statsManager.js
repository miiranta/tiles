const { Player } = require('../domain/models/playerModel');
const { log } = require('../utils/colorLogging');

class StatsManager {
  constructor(database) {
    this.database = database;
  }

  async updateDistanceTraveled(playerName, distance) {
    try {
      const player = await Player.findByName(playerName);
      
      if (player) {
        await player.updateDistanceTraveled(distance);
        log.info('statsManager', `Updated distance for ${playerName}: +${distance.toFixed(2)}`);
      }
    } catch (error) {
      log.error('statsManager', `Error updating distance traveled: ${error.message}`);
    }
  }

  async updateTilesPlaced(playerName, tileType) {
    try {
      const player = await Player.findByName(playerName);
      
      if (player) {
        await player.updateTilesPlaced(tileType);
        log.info('statsManager', `Updated tiles placed for ${playerName}: ${tileType}`);
      }
    } catch (error) {
      log.error('statsManager', `Error updating tiles placed: ${error.message}`);
    }
  }

  async getPlayerStats(playerName) {
    try {
      const player = await Player.findByName(playerName);
      
      if (!player) {
        return null;
      }

      return {
        playerName: player.playerName,
        distanceTraveled: player.stats.distanceTraveled || 0,
        tilesPlaced: Object.fromEntries(player.stats.tilesPlaced || new Map()),
        lastLogin: player.lastLogin,
        createdAt: player.createdAt
      };
    } catch (error) {
      log.error('statsManager', `Error getting player stats: ${error.message}`);
      return null;
    }
  }

  async getAllPlayersStats() {
    try {
      const players = await Player.find({}).select('playerName stats lastLogin createdAt');
      
      return players.map(player => ({
        playerName: player.playerName,
        distanceTraveled: player.stats.distanceTraveled || 0,
        tilesPlaced: Object.fromEntries(player.stats.tilesPlaced || new Map()),
        lastLogin: player.lastLogin,
        createdAt: player.createdAt
      }));
    } catch (error) {
      log.error('statsManager', `Error getting all players stats: ${error.message}`);
      return [];
    }
  }
}

module.exports = { StatsManager };
