/**
 * CricVerse — Seed Test Users
 * Run: node server/scripts/seedUsers.js
 * Creates one account per role for testing.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true, lowercase: true },
    password: String,
    googleId: { type: String, sparse: true },
    avatar: { type: String, default: '' },
    role: { type: String, enum: ['player', 'organizer', 'admin'], default: 'player' },
    createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

const testUsers = [
    {
        name: 'Alex Player',
        email: 'player@cricverse.com',
        password: 'Player@123',
        role: 'player',
    },
    {
        name: 'Sam Organizer',
        email: 'organizer@cricverse.com',
        password: 'Organizer@123',
        role: 'organizer',
    },
    {
        name: 'Admin CricVerse',
        email: 'admin@cricverse.com',
        password: 'Admin@123',
        role: 'admin',
    },
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connected');

        for (const u of testUsers) {
            const existing = await User.findOne({ email: u.email });
            if (existing) {
                console.log(`⚠️  Skipped (already exists): ${u.email}`);
                continue;
            }

            const salt = await bcrypt.genSalt(12);
            const hashedPassword = await bcrypt.hash(u.password, salt);

            await User.create({ ...u, password: hashedPassword });
            console.log(`✅ Created [${u.role}]: ${u.email}  →  password: ${u.password}`);
        }

        console.log('\n🏏 Seed complete! Test credentials:');
        console.log('  player@cricverse.com     / Player@123');
        console.log('  organizer@cricverse.com  / Organizer@123');
        console.log('  admin@cricverse.com      / Admin@123');
    } catch (err) {
        console.error('❌ Seed error:', err.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

seed();
