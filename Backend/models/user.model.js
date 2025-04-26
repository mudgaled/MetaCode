/*const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    Name: { 
        type: String, 
        required: true 
    },
    Email: {
        type: String,
        required: true,
        unique: true
    },
    Password: {
        type: String,
        required: true
    },
    Role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    AvatarID: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Avatar',
        required: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);*/

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long']
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    // New Metaverse-specific fields
    avatar: {
        type: {
            id: {
                type: String,
                default: 'https://res.cloudinary.com/dnfqurz0t/image/upload/v1745620292/avatar_1_ewumxl.svg'
            },
            name: {
                type: String,
                default: 'Default Avatar'
            },
            color: {
                type: String,
                default: '#3498db'
            }
        },
        default: {}
    },
    currentRoom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        default: null
    },
    status: {
        type: String,
        enum: ['online', 'offline', 'in-room', 'coding'],
        default: 'offline'
    },
    skills: [{
        type: String
    }],
    preferences: {
        type: {
            theme: {
                type: String,
                default: 'light'
            },
            language: {
                type: String,
                default: 'en'
            }
        },
        default: {}
    },
    socialLinks: {
        type: {
            github: String,
            linkedin: String
        },
        default: {}
    },
    defaultAvatar: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Avatar',
        default: null
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);