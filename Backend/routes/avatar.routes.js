const express = require('express');
const router = express.Router();
const { 
    getAvailableAvatars,
    purchaseAvatar,
    getUserAvatars,
    createAvatar,
    updateAvatar,
    deleteAvatar
} = require('../controllers/avatar.controller');
const verifyUserMiddleware = require('../middleware/userAuth');
// const { verifyAdminMiddleware } = require('../middleware/adminAuth');

// Public routes
router.get('/', getAvailableAvatars);

// Protected routes (require authentication)
router.get('/my-avatars', verifyUserMiddleware, getUserAvatars);
router.post('/purchase/:avatarId', verifyUserMiddleware, purchaseAvatar);

// Admin routes (using user middleware for now, will add admin check in controller)
router.post('/admin/create', verifyUserMiddleware, createAvatar);
router.put('/admin/:avatarId', verifyUserMiddleware, updateAvatar);
router.delete('/admin/:avatarId', verifyUserMiddleware, deleteAvatar);

module.exports = router; 