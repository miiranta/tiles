const { StatsController }   = require('../controller/statsController');
const { MapController }     = require('../controller/mapController');
const { PlayerController }  = require('../controller/playerController');

const { MapManager }        = require('./mapManager');
const { PlayerManager }     = require('./playerManager');
const { StatsManager }      = require('./statsManager');

class gameManager {

    constructor(app, io, database) {
        this.statsManager = new StatsManager(database);
        this.mapManager = new MapManager(database, this.statsManager);
        this.playerManager = new PlayerManager(database, this.statsManager);
        
        this.statsController = new StatsController(app, this.statsManager);
        this.mapController = new MapController(app, io, this.mapManager);
        this.playerController = new PlayerController(app, io, this.playerManager);
    }

}

module.exports = { GameManager: gameManager };