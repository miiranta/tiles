const express = require('express');
const { log } = require('../utils/colorLogging');

class StatsController {
  constructor(app, statsManager) {
    this.app = app;
    this.statsManager = statsManager;
    this.setupRoutes();
  }

  setupRoutes() {
    const router = express.Router();

    // GET /stats/:playerName - Get player statistics
    router.get('/stats/:playerName', async (req, res) => {
      try {
        const { playerName } = req.params;

        if (!playerName) {
          return res.status(400).json({ error: 'Player name is required' });
        }

        const stats = await this.statsManager.getPlayerStats(playerName);
        
        if (!stats) {
          return res.status(404).json({ error: 'Player not found' });
        }

        res.json(stats);
        log.info('statsController', `Stats retrieved for player: ${playerName}`);

      } catch (error) {
        log.error('statsController', `Error getting player stats: ${error.message}`);
        res.status(500).json({ error: 'Internal server error' });
      }
    });    
    
    this.app.use(router);
    log.info('statsController', 'Stats endpoints configured');
  }
}

module.exports = { StatsController };
