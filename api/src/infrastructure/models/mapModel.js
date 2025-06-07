const mongoose = require("mongoose");

const mapModel = mongoose.Schema({
    x: Number, 
    y: Number,
    tile: {
        type: String,
    },
}, { timestamps: true });

module.exports = mapModel;