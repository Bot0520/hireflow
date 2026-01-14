// File: clear-data.js
// 
// Purpose: Delete all Hires and Vehicles from MongoDB
// Keep: Organizations, Users
//
// Usage: node clear-data.js

const mongoose = require('mongoose');

// REPLACE WITH YOUR MONGODB_URI (same as in .env.local)
const MONGODB_URI = 'mongodb+srv://thiroshmadhusha0520_db_user:2057060%2A%23Tm@cluster0.oqqnqgb.mongodb.net/hireflow?retryWrites=true&w=majority&appName=Cluster0';

async function clearData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    console.log('');

    // Get the database connection
    const db = mongoose.connection;

    // Delete all hires
    try {
      const hiresResult = await db.collection('hires').deleteMany({});
      console.log(`✅ Deleted ${hiresResult.deletedCount} hires`);
    } catch (error) {
      console.log('⚠️  Hires collection not found or already empty');
    }

    // Delete all vehicles
    try {
      const vehiclesResult = await db.collection('vehicles').deleteMany({});
      console.log(`✅ Deleted ${vehiclesResult.deletedCount} vehicles`);
    } catch (error) {
      console.log('⚠️  Vehicles collection not found or already empty');
    }

    console.log('');
    console.log('✅ Database cleared successfully!');
    console.log('');
    console.log('📝 Remaining data:');
    console.log('   - Organizations (intact)');
    console.log('   - Users (intact)');
    console.log('');
    console.log('🔄 Next step: Run "node setup-test-data.js" to create test data');
    console.log('');

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('');
    console.error('Troubleshooting:');
    console.error('1. Check if MONGODB_URI is correct');
    console.error('2. Check if MongoDB cluster is running');
    console.error('3. Check network access in MongoDB Atlas');
    process.exit(1);
  }
}

clearData();