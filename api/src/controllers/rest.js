const express               = require('express');
const path                  = require('path');
const cors                  = require('cors');
const { COLORS }            = require('../database/models/Tile');
const gameServer            = require('../game/gameServer')();
const { log }               = require('../utils/colorLogging');

// Load environment variables if not already loaded
if (!process.env.BASE_URL) {
    const dotenvPath = path.join(__dirname, '../../environments', '.env');
    require('dotenv').config({ path: dotenvPath });
}

const ANGULAR_FOLDER = path.join(__dirname, '../../app/dist/tiles/browser');

const setupRest = (app) => {
    // CORS
    app.use(cors({
        origin: '*'
    }));

    // JSON parsing middleware
    app.use(express.json());

    // Public folder
    app.use(express.static(ANGULAR_FOLDER));

    // Setup router
    const router = express.Router();
    setupRestEndpoints(router);
    app.use(router);
    
    log.info('rest', 'REST endpoints configured');
}

const setupRestEndpoints = (router) => {

    // GET /
    // Envia o app Angular ao cliente
    router.get('/', (req, res) => {
        res.sendFile(path.join(ANGULAR_FOLDER, '/index.html'));
    });

    // GET tiles
    // Envia os tiles do mapa
    router.get('/map/:x/:y/:render', async (req, res) => { 
        try {
            if (!req.params.x || !req.params.y || !req.params.render) {
                return res.status(400).json({ error: 'Missing parameters' });
            }

            const x = parseInt(req.params.x);
            const y = parseInt(req.params.y);
            const render = parseInt(req.params.render);

            // Validation
            if (render > 100) {
                return res.status(400).json({ error: 'Render value too high (>100)' });
            }
            if (render < 0) {
                return res.status(400).json({ error: 'Render value too low (<0)' });
            }
            if (isNaN(x) || isNaN(y) || isNaN(render)) {
                return res.status(400).json({ error: 'Invalid coordinates or render value' });
            }

            // Get tiles from database
            const tiles = await gameServer.getTiles(x, y, render);
              res.json(tiles);
        } catch (error) {
            log.error('rest', `Error fetching tiles: ${error.message}`);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // PUT tiles
    // Atualiza um tile do mapa
    router.put('/map/:x/:y/:type', async (req, res) => { 
        try {
            if (!req.params.x || !req.params.y || !req.params.type) {
                return res.status(400).json({ error: 'Missing parameters' });
            }

            const x = parseInt(req.params.x);
            const y = parseInt(req.params.y);
            const type = req.params.type;

            // Validation
            if (!COLORS.includes(type)) {
                return res.status(400).json({ error: 'Invalid color' });
            }
            if (isNaN(x) || isNaN(y)) {
                return res.status(400).json({ error: 'Invalid coordinates' });
            }

            // Get player name from request body or headers (optional)
            const playerName = req.body?.playerName || req.headers['x-player-name'] || 'anonymous';

            // Place tile in database
            const success = await gameServer.placeTile(x, y, type, playerName);
            
            if (success) {
                res.status(200).json({ success: true });
            } else {
                res.status(500).json({ error: 'Failed to place tile' });
            }        } catch (error) {
            log.error('rest', `Error placing tile: ${error.message}`);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

}

module.exports = setupRest;