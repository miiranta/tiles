const mongoose = require('mongoose');
const { COLORS } = require('../enums/colors');

const tileSchema = new mongoose.Schema({
  x: {
    type: Number,
    required: true,
    index: true
  },
  y: {
    type: Number,
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: COLORS,
    default: 'white'
  },
  lastModified: {
    type: Date,
    default: Date.now
  },
  modifiedBy: {
    type: String,
    default: 'system'
  }
}, {
  timestamps: true
});

tileSchema.index({ x: 1, y: 1 }, { unique: true });

tileSchema.statics.getDefaultType = function(x, y) {
  if ((x % 2 + 2) % 2 === (y % 2 + 2) % 2) {
    return 'white';
  } else {
    return 'lightgray';
  }
};

tileSchema.methods.setDefaultType = function() {
  this.type = this.constructor.getDefaultType(this.x, this.y);
  return this;
};

const Tile = mongoose.model('Tile', tileSchema);

module.exports = { 
  Tile, 
  tileSchema 
};
