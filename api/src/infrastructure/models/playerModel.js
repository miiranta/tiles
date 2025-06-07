const mongoose = require("mongoose");

const playerModel = mongoose.Schema({
    x: Number, 
    y: Number,
    name: String,
    stats: {
        tilesPlaced: [{
            type: String,
            amount: Number
        }],
        distanceTraveled: Number,
    }
}, { timestamps: true });

module.exports = playerModel;