const mongoose = require('mongoose');
const Avatar = require('../models/Avatar');
require('dotenv').config();

async function resetAvatars() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Update all avatars to set boughtBy to null
    const result = await Avatar.updateMany(
      { boughtBy: { $exists: true } },
      { $set: { boughtBy: null } }
    );

    console.log(`Updated ${result.modifiedCount} avatars`);
    console.log('All avatars have been reset to available status');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the script
resetAvatars(); 