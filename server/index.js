const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const dotenv = require('dotenv');

dotenv.config();

// Passport config
require('./config/passport');

const app = express();

// ── Middleware ────────────────────────────────────────────
app.use(cors({
    origin: [process.env.CLIENT_URL || 'http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));


app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' },
}));

app.use(passport.initialize());
app.use(passport.session());

// ── Routes ────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/auth', require('./routes/googleAuth'));
app.use('/api/tournaments', require('./routes/tournaments'));
app.use('/api/teams', require('./routes/teams'));
app.use('/api', require('./routes/matches'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'CricVerse API is running 🏏' });
});

// ── MongoDB Connection ────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('✅ MongoDB connected successfully');
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`🚀 CricVerse server running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err.message);
        process.exit(1);
    });
