const { TileMap, COLORS } = require('./game');

class GameServer {
    constructor() {
        this.map = new TileMap();
    }

    getTile(x, y) {
        return this.map.getTile(x, y);
    }

    placeTile(x, y, type) {
        this.map.placeTile(x, y, type);
    }
}

let gameServer = new GameServer();
const getGameServer = () => {
    return gameServer;
}

module.exports = getGameServer;
