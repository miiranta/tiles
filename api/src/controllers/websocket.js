const { Server } = require('socket.io');
const gameServer = require('../game/gameServer')();
const { log } = require('../utils/colorLogging');

const setupWebsockets = (server) => {
    const io = new Server(server, {
      cors: {
        origin: '*'
      }
    });

    setupWebsocketsStreams(io);
}

const setupWebsocketsStreams = (io) => {

    io.on('connection', (socket) => {
        log.info('websocket', `Client connected: ${socket.id}`);

        // Player position updates
        socket.on('playerPosition', (data) => {
            try {
                const { playerName, x, y } = data;
                
                if (typeof x !== 'number' || typeof y !== 'number' || !playerName) {
                    return;
                }

                // Broadcast to all other clients (not sender)
                socket.broadcast.emit('playerPosition', { 
                    playerName, 
                    x, 
                    y 
                });
            } catch (error) {
                log.error('websocket', `Error handling player position: ${error.message}`);
            }
        });

        // Tile placement
        socket.on('tilePlaced', async (data) => {
            try {
                const { x, y, type, playerName } = data;
                
                if (typeof x !== 'number' || typeof y !== 'number' || !type) {
                    return;
                }

                const success = await gameServer.placeTile(x, y, type, playerName || 'anonymous');
                
                if (success) {
                    // Broadcast to all clients including sender
                    io.emit('tilePlaced', { x, y, type, playerName });
                    log.info('websocket', `Tile placed at (${x}, ${y}) with color ${type} by ${playerName || 'anonymous'}`);
                }
            } catch (error) {
                log.error('websocket', `Error placing tile: ${error.message}`);
            }
        });

        // Disconnect
        socket.on('disconnect', () => {
            log.info('websocket', `Client disconnected: ${socket.id}`);
        });

    });

}

module.exports = setupWebsockets;
