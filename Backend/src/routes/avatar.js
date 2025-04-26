const express = require('express');
const router = express.Router();
const Avatar = require('../models/Avatar');
const auth = require('../middleware/auth');

// Get all avatars
router.get('/', async (req, res) => {
  try {
    const avatars = await Avatar.find();
    res.json({ success: true, data: avatars });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get bought avatars for a user
router.get('/bought', auth, async (req, res) => {
  try {
    const avatars = await Avatar.find({ boughtBy: req.user._id });
    res.json({ success: true, data: avatars });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get sold avatars
router.get('/sold', auth, async (req, res) => {
  try {
    const avatars = await Avatar.find({ boughtBy: { $exists: true, $ne: null } });
    res.json({ success: true, data: avatars });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Purchase an avatar
router.post('/purchase/:id', auth, async (req, res) => {
  try {
    const avatar = await Avatar.findById(req.params.id);
    
    if (!avatar) {
      return res.status(404).json({ success: false, message: 'Avatar not found' });
    }

    if (avatar.boughtBy) {
      return res.status(400).json({ success: false, message: 'Avatar already sold' });
    }

    avatar.boughtBy = req.user._id;
    await avatar.save();

    res.json({ success: true, data: avatar });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router; 