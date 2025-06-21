const { Tile } = require('../domain/models/tileModel');
const { COLORS } = require('../domain/enums/colors');
const { log } = require('../utils/colorLogging');

class MapManager {
  constructor(database, statsManager) {
    this.database = database;
    this.statsManager = statsManager;
  }

  async getTile(x, y) {
    try {
      let tile = await Tile.findOne({ x, y });
      
      if (!tile) {
        // Create a new tile with default type based on coordinates
        tile = new Tile({ x, y });
        tile.setDefaultType();
        await tile.save();
      }
      
      return {
        x: tile.x,
        y: tile.y,
        type: tile.type
      };
    } catch (error) {
      log.error('mapManager', `Error getting tile: ${error.message}`);
      // Return a default tile on error
      return {
        x,
        y,
        type: Tile.getDefaultType(x, y)
      };
    }
  }

  async getTiles(centerX, centerY, render) {
    try {
      const tiles = [];
      const halfRender = Math.floor(render / 2);
      
      const minX = centerX - halfRender;
      const maxX = centerX + halfRender;
      const minY = centerY - halfRender;
      const maxY = centerY + halfRender;
      
      const existingTiles = await Tile.find({
        x: { $gte: minX, $lte: maxX },
        y: { $gte: minY, $lte: maxY }
      });
      
      const tileMap = new Map();
      existingTiles.forEach(tile => {
        tileMap.set(`${tile.x},${tile.y}`, tile);
      });
      
      for (let i = minX; i <= maxX; i++) {
        for (let j = minY; j <= maxY; j++) {
          const key = `${i},${j}`;
          let tile = tileMap.get(key);
          
          if (!tile) {
            tiles.push({
              x: i,
              y: j,
              type: Tile.getDefaultType(i, j)
            });
          } else {
            tiles.push({
              x: tile.x,
              y: tile.y,
              type: tile.type
            });
          }
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
        await this.statsManager.updateTilesPlaced(playerName, type);
      }
      
      return true;
    } catch (error) {
      log.error('mapManager', `Error placing tile: ${error.message}`);
      return false;
    }
  }
}

module.exports = { MapManager };
