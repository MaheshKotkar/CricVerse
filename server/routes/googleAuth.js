const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// ── @route   GET /api/auth/google
// ── @desc    Initiate Google OAuth
// ── @access  Public
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// ── @route   GET /api/auth/google/callback
// ── @desc    Google OAuth callback — generate JWT and redirect to frontend
// ── @access  Public
router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/auth?error=google_failed` }),
    (req, res) => {
        const token = generateToken(req.user._id);
        // Redirect to frontend with token in query param (frontend reads it on mount)
        res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}&name=${encodeURIComponent(req.user.name)}&email=${encodeURIComponent(req.user.email)}&avatar=${encodeURIComponent(req.user.avatar || '')}`);
    }
);

module.exports = router;
