class StatsController {
  
  constructor(app, statsManager) {
    this.setupRestRoutes(app);
  }

  setupRestRoutes(app) {

    // GET /stats/:id
    app.get('/stats/:id', (req, res) => {
      
    });
    
  }
}

module.exports = { StatsController: StatsController };