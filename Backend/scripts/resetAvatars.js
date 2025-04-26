const mongoose = require('mongoose');
const Avatar = require('../models/avatar.model');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function resetAvatars() {
  try {
    // Check if MONGODB_URI exists
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    // Connect to MongoDB
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Update all avatars to set boughtBy to null and buyStatus to available
    const result = await Avatar.updateMany(
      { boughtBy: { $exists: true } },
      { 
        $set: { 
          boughtBy: null,
          buyStatus: 'available'
        } 
      }
    );

    console.log(`Updated ${result.modifiedCount} avatars`);
    console.log('All avatars have been reset to available status');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    // Close the MongoDB connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    }
  }
}

// Run the script
resetAvatars();