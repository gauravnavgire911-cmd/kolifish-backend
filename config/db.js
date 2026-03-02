const mongoose = require('mongoose');

const connectDB = async (uri) => {
  try {
    // If no URI provided, use environment variable
    const mongoURI = uri || process.env.MONGO_URI;
    
    if (!mongoURI) {
      throw new Error('MongoDB URI not found. Please set MONGO_URI in .env');
    }

    const options = {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 30000,
    };

    const conn = await mongoose.connect(mongoURI, options);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`   Database Name: ${conn.connection.name}`);
    
    // Connection event listeners
    mongoose.connection.on('connected', () => {
      console.log('📡 MongoDB connection established');
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB connection lost');
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB error:', err.message);
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('👋 MongoDB connection closed due to app termination');
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await mongoose.connection.close();
      console.log('👋 MongoDB connection closed due to app termination');
      process.exit(0);
    });

    return conn;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;