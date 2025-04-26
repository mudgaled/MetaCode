const Avatar = require('../models/avatar.model');
const User = require('../models/user.model');
const { ApiError } = require('../utils/ApiError');
const { asyncHandler } = require('../utils/asyncHandler');

/**
 * Get all available avatars from the store
 * @route GET /api/avatar
 * @access Public
 */
const getAvailableAvatars = asyncHandler(async (req, res) => {
    try {
        const avatars = await Avatar.find({ buyStatus: 'available' })
            .select('name description imageUrl price')
            .sort({ createdAt: -1 });

        if (!avatars || avatars.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No avatars available in the store',
                data: []
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Avatars retrieved successfully',
            data: avatars
        });
    } catch (error) {
        throw new ApiError(
            500,
            'Error retrieving avatars from store',
            error.message
        );
    }
});

/**
 * Get avatars owned by the current user
 * @route GET /api/avatar/my-avatars
 * @access Private
 */
const getUserAvatars = asyncHandler(async (req, res) => {
    try {
        const avatars = await Avatar.find({ boughtBy: req.user.user })
            .select('name description imageUrl price')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: 'User avatars retrieved successfully',
            data: avatars
        });
    } catch (error) {
        throw new ApiError(
            500,
            'Error retrieving user avatars',
            error.message
        );
    }
});

/**
 * Purchase an avatar
 * @route POST /api/avatar/purchase/:avatarId
 * @access Private
 */
const purchaseAvatar = asyncHandler(async (req, res) => {
    try {
        const { avatarId } = req.params;
        const userId = req.user.user;

        const avatar = await Avatar.findById(avatarId);
        if (!avatar) {
            throw new ApiError(404, 'Avatar not found');
        }

        if (avatar.buyStatus === 'sold') {
            throw new ApiError(400, 'Avatar is already sold');
        }

        // Update avatar status
        avatar.buyStatus = 'sold';
        avatar.boughtBy = userId;
        await avatar.save();

        // Update user's avatar
        await User.findByIdAndUpdate(userId, {
            'avatar.id': avatarId,
            'avatar.name': avatar.name
        });

        return res.status(200).json({
            success: true,
            message: 'Avatar purchased successfully',
            data: avatar
        });
    } catch (error) {
        throw new ApiError(
            error.statusCode || 500,
            error.message || 'Error purchasing avatar',
            error.stack
        );
    }
});

/**
 * Create a new avatar (Admin only)
 * @route POST /api/avatar/admin/create
 * @access Private/Admin
 */
const createAvatar = asyncHandler(async (req, res) => {
    try {
        // Check if user is admin
        const user = await User.findById(req.user.user);
        if (!user || user.role !== 'admin') {
            throw new ApiError(403, 'Access denied. Admin privileges required.');
        }

        const { name, description, imageUrl, price } = req.body;

        const avatar = await Avatar.create({
            name,
            description,
            imageUrl,
            price,
            buyStatus: 'available'
        });

        return res.status(201).json({
            success: true,
            message: 'Avatar created successfully',
            data: avatar
        });
    } catch (error) {
        throw new ApiError(
            error.statusCode || 500,
            error.message || 'Error creating avatar',
            error.stack
        );
    }
});

/**
 * Update an avatar (Admin only)
 * @route PUT /api/avatar/admin/:avatarId
 * @access Private/Admin
 */
const updateAvatar = asyncHandler(async (req, res) => {
    try {
        // Check if user is admin
        const user = await User.findById(req.user.user);
        if (!user || user.role !== 'admin') {
            throw new ApiError(403, 'Access denied. Admin privileges required.');
        }

        const { avatarId } = req.params;
        const { name, description, imageUrl, price } = req.body;

        const avatar = await Avatar.findById(avatarId);
        if (!avatar) {
            throw new ApiError(404, 'Avatar not found');
        }

        const updatedAvatar = await Avatar.findByIdAndUpdate(
            avatarId,
            {
                name,
                description,
                imageUrl,
                price
            },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: 'Avatar updated successfully',
            data: updatedAvatar
        });
    } catch (error) {
        throw new ApiError(
            error.statusCode || 500,
            error.message || 'Error updating avatar',
            error.stack
        );
    }
});

/**
 * Delete an avatar (Admin only)
 * @route DELETE /api/avatar/admin/:avatarId
 * @access Private/Admin
 */
const deleteAvatar = asyncHandler(async (req, res) => {
    try {
        // Check if user is admin
        const user = await User.findById(req.user.user);
        if (!user || user.role !== 'admin') {
            throw new ApiError(403, 'Access denied. Admin privileges required.');
        }

        const { avatarId } = req.params;

        const avatar = await Avatar.findById(avatarId);
        if (!avatar) {
            throw new ApiError(404, 'Avatar not found');
        }

        if (avatar.buyStatus === 'sold') {
            throw new ApiError(400, 'Cannot delete a sold avatar');
        }

        await Avatar.findByIdAndDelete(avatarId);

        return res.status(200).json({
            success: true,
            message: 'Avatar deleted successfully'
        });
    } catch (error) {
        throw new ApiError(
            error.statusCode || 500,
            error.message || 'Error deleting avatar',
            error.stack
        );
    }
});

module.exports = {
    getAvailableAvatars,
    getUserAvatars,
    purchaseAvatar,
    createAvatar,
    updateAvatar,
    deleteAvatar
}; 