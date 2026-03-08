const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const upload = require('../middleware/upload');

// ── @route   POST /api/teams
// ── @desc    Create a new team
// ── @access  Private/Organizer
router.post('/', protect, authorize('organizer', 'admin'), upload.single('logo'), async (req, res) => {
    try {
        req.body.organizer = req.user.id;

        // If file uploaded, store the Cloudinary path
        if (req.file) {
            req.body.logo = req.file.path;
        }

        // Handle players if sent as stringified JSON (common in FormData)
        if (typeof req.body.players === 'string') {
            try {
                req.body.players = JSON.parse(req.body.players);
            } catch (e) {
                console.error("Failed to parse players JSON:", e);
            }
        }

        const team = await Team.create(req.body);

        res.status(201).json({ success: true, data: team });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// ── @route   GET /api/teams
// ── @desc    Get all teams for the organizer
// ── @access  Private/Organizer
router.get('/', protect, authorize('organizer', 'admin'), async (req, res) => {
    try {
        let query;
        if (req.user.role === 'admin') {
            query = Team.find();
        } else {
            query = Team.find({ organizer: req.user.id });
        }
        const teams = await query;
        res.status(200).json({ success: true, count: teams.length, data: teams });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// ── @route   GET /api/teams/:id
// ── @desc    Get a single team by ID
// ── @access  Private/Organizer
router.get('/:id', protect, authorize('organizer', 'admin'), async (req, res) => {
    try {
        const team = await Team.findById(req.params.id);

        if (!team) {
            return res.status(404).json({ success: false, message: 'Team not found' });
        }

        // Make sure the user owns the team, or is an admin
        if (team.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to access this team' });
        }

        res.status(200).json({ success: true, data: team });
    } catch (err) {
        console.error("Get Single Team Error:", err);
        // If it's not a valid ObjectId, it will throw a CastError.
        if (err.name === 'CastError') {
            return res.status(404).json({ success: false, message: 'Team not found' });
        }
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;
