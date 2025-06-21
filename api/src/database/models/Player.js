const mongoose = require('mongoose');
const crypto = require('crypto');

const playerSchema = new mongoose.Schema({
  playerName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 2,
    maxlength: 20
  },
  passwordHash: {
    type: String,
    required: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

playerSchema.methods.setPassword = function(password) {
  this.passwordHash = crypto.createHash('sha256').update(password).digest('hex');
};

playerSchema.methods.validatePassword = function(password) {
  const hash = crypto.createHash('sha256').update(password).digest('hex');
  return this.passwordHash === hash;
};

playerSchema.statics.findByName = function(playerName) {
  return this.findOne({ playerName: playerName.trim() });
};

const Player = mongoose.model('Player', playerSchema);

module.exports = {
  Player
};
