const { Server } = require('socket.io');
const gameServer = require('../game/gameServer')();
const tokenHandler = require('../utils/tokenHandler');
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
        
        // Store the player name associated with this socket
        let socketPlayerName = null;

        // Helper function to authenticate and store player name
        const authenticateSocket = (token) => {
            const tokenInfo = tokenHandler.verifyToken(token);
            if (tokenInfo.valid) {
                socketPlayerName = tokenInfo.playerName;
                return tokenInfo;
            }
            return null;
        };

        // Player position updates
        socket.on('player-update', (data) => {
            try {
                const { token, x, y } = data;
                
                if (!token || typeof x !== 'number' || typeof y !== 'number') {
                    return;
                }

                // Verify JWT token and store player name
                const tokenInfo = authenticateSocket(token);
                if (!tokenInfo) {
                    socket.emit('auth-error', { message: 'Invalid or expired token' });
                    return;
                }

                // Broadcast to all other clients (not sender)
                socket.broadcast.emit('player-update', { 
                    playerName: tokenInfo.playerName,
                    x, 
                    y 
                });

            } catch (error) {
                log.error('websocket', `Error handling player update: ${error.message}`);
            }
        });

        // Tile placement
        socket.on('tilePlaced', async (data) => {
            try {
                const { token, x, y, type } = data;
                
                if (!token || typeof x !== 'number' || typeof y !== 'number' || !type) {
                    return;
                }

                // Verify JWT token and store player name
                const tokenInfo = authenticateSocket(token);
                if (!tokenInfo) {
                    socket.emit('auth-error', { message: 'Invalid or expired token' });
                    return;
                }

                const success = await gameServer.placeTile(x, y, type, tokenInfo.playerName);
                
                if (success) {
                    // Broadcast to all clients including sender
                    io.emit('tilePlaced', { x, y, type, playerName: tokenInfo.playerName });
                    log.info('websocket', `Tile placed at (${x}, ${y}) with color ${type} by ${tokenInfo.playerName}`);
                }
            } catch (error) {
                log.error('websocket', `Error placing tile: ${error.message}`);
            }
        });

        // Disconnect
        socket.on('disconnect', () => {
            try {
                if (socketPlayerName) {
                    // Revoke the token for this player
                    const removedPlayerName = tokenHandler.revokeToken(socketPlayerName);
                    if (removedPlayerName) {
                        // Notify all clients that this player has disconnected
                        socket.broadcast.emit('player-remove', { playerName: removedPlayerName });
                        log.info('websocket', `Player disconnected: ${removedPlayerName} (${socket.id})`);
                    }
                } else {
                    log.info('websocket', `Client disconnected: ${socket.id}`);
                }
            } catch (error) {
                log.error('websocket', `Error handling disconnect: ${error.message}`);
            }
        });

    });

}

module.exports = setupWebsockets;
