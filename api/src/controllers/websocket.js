const { Server } = require('socket.io');

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

        // Player postions
        socket.on('playerPosition', (data) => {
            io.emit('playerPosition', data);
        });

        // Player colors
        socket.on('tilePlaced', (data) => {
            io.emit('tilePlaced', data);
        });

        // Disconnect
        socket.on('disconnect', () => {});

    });

}

module.exports = setupWebsockets;
