const mongoose      = require('mongoose');
const playerModel   = require('./models/playerModel');
const mapModel      = require('./models/mapModel');

class Database {

    constructor(connectionString) {
        this.connect(connectionString);
    }

    // Start mongo connection
    connect(connectionString) {
        mongoose.connect(connectionString, {})
        .then(() => {
            console.log('Database connection established successfully.');
            this.loadModels();
        })
        .catch(err => console.error('Database connection error:', err));
    }

    // Load mongoose models
    loadModels() {
        mongoose.model('Player', playerModel);
        mongoose.model('Map', mapModel);
    }

}

module.exports = { Database };