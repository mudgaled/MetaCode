const mongoose = require('mongoose');

const avatarSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  imageUrl: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: String,
    required: true,
    trim: true
  },
  buyStatus: {
    type: String,
    enum: ['available', 'sold'],
    default: 'available'
  },
  boughtBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
avatarSchema.index({ name: 1 });
avatarSchema.index({ price: 1 });
avatarSchema.index({ buyStatus: 1 });
avatarSchema.index({ boughtBy: 1 });

const Avatar = mongoose.model('Avatar', avatarSchema);

module.exports = Avatar; 