const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const Avatar = require('../models/avatar.model');
const auth = require('../middleware/userAuth');

// Get default avatar
router.get('/default-avatar', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('defaultAvatar');
    
    if (!user.defaultAvatar) {
      return res.json({
        success: true,
        data: null,
        message: 'No default avatar set'
      });
    }

    res.json({
      success: true,
      data: user.defaultAvatar
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Set default avatar
router.post('/set-default-avatar/:avatarId', auth, async (req, res) => {
  try {

    if (!req.params.avatarId) {
      return res.status(400).json({
        success: false,
        message: 'Avatar ID is required'
      });
    }

    // Check if the avatar exists and is owned by the user
    const avatar = await Avatar.findOne({
      _id: req.params.avatarId,
      boughtBy: req.user._id
    });
    console.log(avatar);

    if (!avatar) {
      return res.status(404).json({
        success: false,
        message: 'Avatar not found or not owned by you'
      });
    }

    // Update user's default avatar
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { defaultAvatar: avatar._id },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Default avatar updated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router; 