const { Tile } = require('../domain/models/tileModel');
const { COLORS } = require('../domain/enums/colors');
const { log } = require('../utils/colorLogging');

class MapManager {
  constructor(database, statsManager) {
    this.database = database;
    this.statsManager = statsManager;
  }  
  
  async getTiles(centerX, centerY, range) {
    try {
      const tiles = [];
      const halfRange = Math.floor(range / 2);
      
      const minX = centerX - halfRange;
      const maxX = centerX + halfRange;
      const minY = centerY - halfRange;
      const maxY = centerY + halfRange;
      
      const existingTiles = await Tile.find({
        x: { $gte: minX, $lte: maxX },
        y: { $gte: minY, $lte: maxY }
      }).select('x y type').lean();
      
      const tileMap = new Map();
      existingTiles.forEach(tile => {
        tileMap.set(`${tile.x},${tile.y}`, tile);
      });
      
      const totalTiles = (maxX - minX + 1) * (maxY - minY + 1);
      tiles.length = totalTiles;
      let index = 0;
      
      for (let i = minX; i <= maxX; i++) {
        for (let j = minY; j <= maxY; j++) {
          const key = `${i},${j}`;
          const tile = tileMap.get(key);
          
          if (!tile) {
            tiles[index] = {
              x: i,
              y: j,
              type: Tile.getDefaultType(i, j)
            };
          } else {
            tiles[index] = {
              x: tile.x,
              y: tile.y,
              type: tile.type
            };
          }
          index++;
        }
      }
      
      return tiles;
    } catch (error) {
      log.error('mapManager', `Error getting tiles: ${error.message}`);
      return [];
    }
  }

  async placeTile(x, y, type, playerName = 'anonymous') {
    try {
      if (!COLORS.includes(type)) {
        throw new Error(`Invalid tile type: ${type}`);
      }
      
      const tile = await Tile.findOneAndUpdate(
        { x, y },
        { 
          type, 
          lastModified: new Date(),
          modifiedBy: playerName
        },
        { 
          upsert: true, 
          new: true,
          runValidators: true
        }
      );
      
      // Update player stats
      if (this.statsManager && playerName !== 'anonymous') {
        this.statsManager.updateTilesPlaced(playerName, type);
      }
      
      return true;
      
    } catch (error) {
      log.error('mapManager', `Error placing tile: ${error.message}`);
      return false;
    }
  }
}

module.exports = { MapManager };
