const express               = require('express');
const path                  = require('path');
const cors                  = require('cors');
const { ANGULAR_FOLDER }    = require('../../conf');
const { COLORS }            = require('../game/game');
const gameServer            = require('../game/gameServer')();

const setupRest = (app) => {
    // Setup router
    const router = express.Router();
    setupRestEndpoints(router);
    app.use(router);

    // Public folder
    app.use(express.static(ANGULAR_FOLDER));

    // CORS
    app.use(cors({
        origin: '*'
    }));
}

const setupRestEndpoints = (router) => {

    // GET /
    // Envia o app Angular ao cliente
    router.get('/', (req, res) => {
        res.sendFile(path.join(ANGULAR_FOLDER, '/index.html'));
    });

    // GET tiles
    // Envia os tiles do mapa
    router.get('/map/:x/:y/:render', (req, res) => { 
        if (!req.params.x || !req.params.y || !req.params.render) {
            return res.status(400).send('Missing parameters');
        }

        const x = parseInt(req.params.x);
        const y = parseInt(req.params.y);
        const render = req.params.render;

        if(render > 100) res.status(400).send('Render value too high (>100)');
        if(render < 0) res.status(400).send('Render value too low (<0)');
        if(isNaN(x) || isNaN(y)) res.status(400).send('Invalid coordinates');

        var tiles = [];
        for(let i = -Math.floor(render / 2); i <= Math.floor(render / 2); i++) {
            for(let j = -Math.floor(render / 2); j <= Math.floor(render / 2); j++) {
            const tile = gameServer.getTile(x + i, y + j);
            if(tile) {
                tiles.push({
                    x: tile.x,
                    y: tile.y,
                    type: tile.type
                });
            }
            }
        }

        res.json(tiles);
    });

    // PUT tiles
    // Atualiza um tile do mapa
    router.put('/map/:x/:y/:type', (req, res) => { 
        if (!req.params.x || !req.params.y || !req.params.type) {
            return res.status(400).send('Missing parameters');
        }

        const x = parseInt(req.params.x);
        const y = parseInt(req.params.y);
        const type = req.params.type;

        if(!COLORS.includes(type)) res.status(400).send('Invalid color');
        if(isNaN(x) || isNaN(y)) res.status(400).send('Invalid coordinates');

        gameServer.placeTile(x, y, type);

        return res.sendStatus(200);
    });

}

module.exports = setupRest;