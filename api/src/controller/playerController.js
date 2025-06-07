class playerController {
  
  constructor(app, io, playerManager) {
    this.setupRestRoutes(app);
    this.setupWebSocketRoutes(io);
  }

  setupRestRoutes(app) {

    // POST /player
    app.post('/player', (req, res) => {
      const playerData = req.body;
    });

  }

  setupWebSocketRoutes(io) {

    io.on('connection', (ws) => {

      // WS "player-update"
      ws.on('player-update', (message) => {
        
      });

      // WS "player-remove"
      ws.on('close', () => {
        
      });

    });

  }


}

module.exports = { PlayerController: playerController };