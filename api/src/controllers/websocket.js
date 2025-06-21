const { Server } = require('socket.io');
const gameServer = require('../game/gameServer')();
const tokenHandler = require('../utils/tokenHandler');
const { log } = require('../utils/colorLogging');
const { Player } = require('../database/models/Player');

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

        let socketPlayerName = null;
        let lastPlayerPosition = { x: 0, y: 0 };   
        const authenticateSocket = (token) => {
            const tokenInfo = tokenHandler.verifyToken(token);
            if (tokenInfo.valid) {
                socketPlayerName = tokenInfo.playerName;
                return tokenInfo;
            }
            return null;
        };

        // Player position updates
        socket.on('player-update', async (data) => {
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
                
                // Calculate distance traveled if we have a previous position
                if (lastPlayerPosition.x !== 0 || lastPlayerPosition.y !== 0) {
                    const distance = Math.sqrt(
                        Math.pow(x - lastPlayerPosition.x, 2) + 
                        Math.pow(y - lastPlayerPosition.y, 2)
                    );
                    
                    // Update player stats in database asynchronously (non-blocking)
                    if (distance > 0 && distance < 1000) { // Prevent 'teleportation'
                        setImmediate(async () => {
                            try {
                                const player = await Player.findByName(tokenInfo.playerName);
                                if (player) {
                                    await player.updateDistanceTraveled(distance);
                                }
                            } catch (dbError) {
                                log.error('websocket', `Error updating distance for ${tokenInfo.playerName}: ${dbError.message}`);
                            }
                        });
                    }
                }
                
                // Update last position
                lastPlayerPosition = { x, y };

                // Broadcast to all other clients (not sender) IMMEDIATELY
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
        socket.on('map-place', async (data) => {
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
                    // Broadcast to all clients including sender IMMEDIATELY
                    io.emit('map-place', { x, y, type, playerName: tokenInfo.playerName });
                    log.info('websocket', `Tile placed at (${x}, ${y}) with color ${type} by ${tokenInfo.playerName}`);
                    
                    // Update player tile placement stats asynchronously (non-blocking)
                    setImmediate(async () => {
                        try {
                            const player = await Player.findByName(tokenInfo.playerName);
                            if (player) {
                                await player.updateTilesPlaced(type);
                            }
                        } catch (dbError) {
                            log.error('websocket', `Error updating tile stats for ${tokenInfo.playerName}: ${dbError.message}`);
                        }
                    });
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
