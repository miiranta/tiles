const { StatsController }   = require('../controllers/statsController');
const { MapController }     = require('../controllers/mapController');
const { PlayerController }  = require('../controllers/playerController');

const { MapManager }        = require('./mapManager');
const { PlayerManager }     = require('./playerManager');
const { StatsManager }      = require('./statsManager');

class gameManager {

    constructor(app, server, database) {
        this.statsManager = new StatsManager(database);
        this.mapManager = new MapManager(database, this.statsManager);
        this.playerManager = new PlayerManager(database, this.statsManager);
        
        this.statsController = new StatsController(app, this.statsManager);
        this.mapController = new MapController(app, server, this.mapManager);
        this.playerController = new PlayerController(app, server, this.playerManager);
    }

}

module.exports = { GameManager: gameManager };