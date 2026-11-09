const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai_career_guidance';
  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000
    });
    isConnected = true;
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
    return true;
  } catch (error) {
    isConnected = false;
    console.warn(`[MongoDB Notice] Could not connect to MongoDB Atlas/Local (${error.message}).`);
    console.warn('[MongoDB Notice] Utilizing resilient embedded data store. Application is fully functional!');
    return false;
  }
};

const isDbConnected = () => isConnected;

module.exports = { connectDB, isDbConnected };

