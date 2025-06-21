const mongoose = require('mongoose');
const { log } = require('../utils/colorLogging');

class Database {
  constructor() {
    this.connection = null;
  }

  async connect() {
    try {
      const connectionString = process.env.MONGODB_CONNECTION_STRING;
      
      if (!connectionString) {
        throw new Error('MONGODB_CONNECTION_STRING is not defined in environment variables');
      }      this.connection = await mongoose.connect(connectionString);

      log.success('database', 'Connected to MongoDB successfully');
      
      mongoose.connection.on('error', (err) => {
        log.error('database', `MongoDB connection error: ${err.message}`);
      });

      mongoose.connection.on('disconnected', () => {
        log.info('database', 'MongoDB disconnected');
      });

      return this.connection;
    } catch (error) {
      log.error('database', `Failed to connect to MongoDB: ${error.message}`);
      process.exit(1);
    }
  }

  async disconnect() {
    try {
      await mongoose.disconnect();
      log.info('database', 'Disconnected from MongoDB');
    } catch (error) {
      log.error('database', `Error disconnecting from MongoDB: ${error.message}`);
    }
  }

  getConnection() {
    return this.connection;
  }
}

module.exports = new Database();
