const express               = require('express');
const path                  = require('path');
const cors                  = require('cors');
const { COLORS }            = require('../database/models/Tile');
const { Player }            = require('../database/models/Player');
const gameServer            = require('../game/gameServer')();
const tokenHandler          = require('../utils/tokenHandler');
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
    
    // GET /player/:playerName - Check if player name is available
    router.get('/player/:playerName', async (req, res) => {
        try {
            const { playerName } = req.params;

            if (!playerName || playerName.trim().length === 0) {
                return res.status(400).json({ error: 'Player name is required' });
            }

            const trimmedName = playerName.trim();
            
            if (trimmedName.length < 2 || trimmedName.length > 20) {
                return res.status(400).json({ 
                    error: 'Player name must be between 2 and 20 characters',
                    taken: true 
                });
            }

            // Check if player is currently connected
            const isCurrentlyConnected = !tokenHandler.isNameAvailable(trimmedName);
            
            // Check if player exists in database
            const existingPlayer = await Player.findByName(trimmedName);
            const existsInDatabase = !!existingPlayer;
            
            res.status(200).json({ 
                taken: isCurrentlyConnected,
                available: !isCurrentlyConnected && !existsInDatabase,
                existsInDatabase: existsInDatabase,
                currentlyConnected: isCurrentlyConnected
            });

        } catch (error) {
            log.error('rest', `Error checking player name availability: ${error.message}`);
            res.status(500).json({ error: 'Internal server error', taken: true });
        }
    });    
    
    // POST /player - Create new player with JWT token and password
    router.post('/player', async (req, res) => {
        try {
            const { playerName, socketId, password } = req.body;

            if (!playerName || !socketId) {
                return res.status(400).json({ error: 'Nome de jogador é obrigatório.' });
            }

            if (playerName.trim().length < 2 || playerName.trim().length > 20) {
                return res.status(400).json({ error: 'Nomes de jogador devem ter entre 2 e 20 caracteres.' });
            }

            const trimmedName = playerName.trim();

            // Check if player is currently connected
            if (!tokenHandler.isNameAvailable(trimmedName)) {
                return res.status(409).json({ error: 'Este nome de jogador já está conectado.' });
            }

            if (password) {
                // Creating new player with password
                if (password.length < 4) {
                    return res.status(400).json({ error: 'Senha deve ter pelo menos 4 caracteres.' });
                }

                // Check if player already exists in database
                const existingPlayer = await Player.findByName(trimmedName);
                if (existingPlayer) {
                    return res.status(409).json({ error: 'Este nome de jogador já existe.' });
                }

                // Create new player in database
                const newPlayer = new Player({ playerName: trimmedName });
                newPlayer.setPassword(password);
                await newPlayer.save();

                log.success('rest', `Player created in database: ${trimmedName}`);
            }

            // Generate token for the session
            const result = tokenHandler.generateToken(trimmedName, socketId);

            if (result.success) {
                res.status(201).json({
                    success: true,
                    token: result.token,
                    playerName: result.playerName
                });
                log.success('rest', `Player session created: ${result.playerName}`);
            } else {
                res.status(409).json({ error: result.message });
            }

        } catch (error) {
            log.error('rest', `Error creating player: ${error.message}`);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // POST /player/authenticate - Authenticate existing player
    router.post('/player/authenticate', async (req, res) => {
        try {
            const { playerName, password, socketId } = req.body;

            if (!playerName || !password || !socketId) {
                return res.status(400).json({ error: 'Nome de jogador e senha são obrigatórios.' });
            }

            const trimmedName = playerName.trim();

            // Check if player is currently connected
            if (!tokenHandler.isNameAvailable(trimmedName)) {
                return res.status(409).json({ error: 'Este jogador já está conectado.' });
            }

            // Find player in database
            const player = await Player.findByName(trimmedName);
            if (!player) {
                return res.status(404).json({ error: 'Jogador não encontrado.' });
            }

            // Validate password
            if (!player.validatePassword(password)) {
                return res.status(401).json({ error: 'Senha incorreta.' });
            }

            // Update last login
            player.lastLogin = new Date();
            await player.save();

            // Generate token for the session
            const result = tokenHandler.generateToken(trimmedName, socketId);

            if (result.success) {
                res.status(200).json({
                    success: true,
                    token: result.token,
                    playerName: result.playerName
                });
                log.success('rest', `Player authenticated: ${result.playerName}`);
            } else {
                res.status(500).json({ error: result.message });
            }

        } catch (error) {
            log.error('rest', `Error authenticating player: ${error.message}`);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

}

module.exports = setupRest;