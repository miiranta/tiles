class mapController {

   constructor(app, io, mapManager) {
      this.setupRestRoutes(app);
      this.setupWebSocketRoutes(io);
   } 

   setupRestRoutes(app) {

      // GET /map/:x/:y/:range
      app.get('/map/:x/:y/:range', (req, res) => {

      });

   }

   setupWebSocketRoutes(io) {

      io.on('connection', (ws) => {

         // WS "map-place"
         ws.on('map-place', (message) => {
            
         });

      });

   }


}

module.exports = { MapController: mapController };