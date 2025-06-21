const jwt = require('jsonwebtoken');
const { log } = require('./colorLogging');

class TokenHandler {
    constructor() {
        this.connectedPlayers = new Map(); // playerName -> { socketId, token, connectedAt }
        this.socketToPlayer = new Map(); // socketId -> playerName
    }

    generateToken(playerName, socketId) {
        try {
            if (this.connectedPlayers.has(playerName)) {
                return {
                    success: false,
                    message: 'Este nome de jogador já está em uso.'
                };
            }

            const token = jwt.sign(
                { 
                    playerName, 
                    socketId,
                    timestamp: Date.now()
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            this.connectedPlayers.set(playerName, {
                socketId,
                token,
                connectedAt: new Date()
            });

            this.socketToPlayer.set(socketId, playerName);

            log.success('tokenHandler', `Token generated for player: ${playerName}`);

            return {
                success: true,
                token,
                playerName
            };

        } catch (error) {
            log.error('tokenHandler', `Error generating token: ${error.message}`);
            return {
                success: false,
                message: 'Failed to generate token'
            };
        }
    }

    verifyToken(token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            const playerInfo = this.connectedPlayers.get(decoded.playerName);
            if (!playerInfo || playerInfo.token !== token) {
                return { valid: false, message: 'Token not found or expired' };
            }

            return {
                valid: true,
                playerName: decoded.playerName,
                socketId: decoded.socketId
            };

        } catch (error) {
            log.error('tokenHandler', `Token verification failed: ${error.message}`);
            return { valid: false, message: 'Invalid token' };
        }
    }

    revokeToken(socketId) {
        try {
            const playerName = this.socketToPlayer.get(socketId);
            
            if (playerName) {
                this.connectedPlayers.delete(playerName);
                this.socketToPlayer.delete(socketId);
                
                log.info('tokenHandler', `Token revoked for player: ${playerName}`);
                return playerName;
            }

            return null;

        } catch (error) {
            log.error('tokenHandler', `Error revoking token: ${error.message}`);
            return null;
        }
    }

    getConnectedPlayers() {
        return Array.from(this.connectedPlayers.keys());
    }

    isNameAvailable(playerName) {
        return !this.connectedPlayers.has(playerName);
    }

    getPlayerBySocket(socketId) {
        return this.socketToPlayer.get(socketId) || null;
    }
}

module.exports = new TokenHandler();
