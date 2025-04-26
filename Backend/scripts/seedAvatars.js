const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Avatar = require('../models/avatar.model');

const avatars = [
    {
        name: "Tech Explorer",
        description: "A futuristic avatar perfect for coding enthusiasts",
        imageUrl: "https://res.cloudinary.com/dnfqurz0t/image/upload/v1745620292/avatar_1_ewumxl.svg",
        price: "100",
        buyStatus: "available"
    },
    {
        name: "Digital Ninja",
        description: "Stealthy and agile, for the quick problem solvers",
        imageUrl: "https://res.cloudinary.com/dnfqurz0t/image/upload/v1745620292/avatar_2_ej7gs9.svg",
        price: "150",
        buyStatus: "available"
    },
    {
        name: "Code Wizard",
        description: "Magical powers for debugging and development",
        imageUrl: "https://res.cloudinary.com/dnfqurz0t/image/upload/v1745620292/avatar_3_uoc6bq.svg",
        price: "200",
        buyStatus: "available"
    },
    {
        name: "Pixel Pioneer",
        description: "Trailblazing through the digital frontier",
        imageUrl: "https://res.cloudinary.com/dnfqurz0t/image/upload/v1745620292/avatar_4g_q4rq3e.svg",
        price: "175",
        buyStatus: "available"
    },
    {
        name: "Binary Brawler",
        description: "Ready to fight any coding challenge",
        imageUrl: "https://res.cloudinary.com/dnfqurz0t/image/upload/v1745620292/avatar_5g_zendt4.svg",
        price: "125",
        buyStatus: "available"
    },
    {
        name: "Algorithm Alchemist",
        description: "Transforming complex problems into elegant solutions",
        imageUrl: "https://res.cloudinary.com/dnfqurz0t/image/upload/v1745620294/avatar_6g_jc0gjm.svg",
        price: "250",
        buyStatus: "available"
    },
    {
        name: "Data Druid",
        description: "Master of data manipulation and analysis",
        imageUrl: "https://res.cloudinary.com/dnfqurz0t/image/upload/v1745620293/avatar_7g_tajltt.svg",
        price: "225",
        buyStatus: "available"
    },
    {
        name: "Cloud Commander",
        description: "Ruling the cloud infrastructure with expertise",
        imageUrl: "https://res.cloudinary.com/dnfqurz0t/image/upload/v1745620294/avatar_8g_ivucji.svg",
        price: "300",
        buyStatus: "available"
    },
    {
        name: "Debug Dynamo",
        description: "Unstoppable force in finding and fixing bugs",
        imageUrl: "https://res.cloudinary.com/dnfqurz0t/image/upload/v1745620294/avatar_9g_shxp3m.svg",
        price: "275",
        buyStatus: "available"
    }
];

const seedAvatars = async () => {
    try {
        // Check if MONGODB_URI is defined
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing avatars
        await Avatar.deleteMany({});
        console.log('Cleared existing avatars');

        // Insert new avatars
        const result = await Avatar.insertMany(avatars);
        console.log(`Successfully seeded ${result.length} avatars`);

        // Disconnect from MongoDB
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error seeding avatars:', error);
        process.exit(1);
    }
};

// Run the seed function
seedAvatars(); 