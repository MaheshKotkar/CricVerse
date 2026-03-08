const express = require('express');
const router = express.Router();
const Tournament = require('../models/Tournament');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

// ── @route   POST /api/tournaments
// ── @desc    Create a new tournament
// ── @access  Private/Organizer
router.post('/', protect, authorize('organizer', 'admin'), async (req, res) => {
    try {
        req.body.organizer = req.user.id;
        const tournament = await Tournament.create(req.body);
        res.status(201).json({ success: true, data: tournament });
    } catch (err) {
        console.error('Create Tournament Error:', err);
        res.status(400).json({ success: false, message: err.message });
    }
});

// ── @route   GET /api/tournaments
// ── @desc    Get all tournaments for the logged-in organizer
// ── @access  Private/Organizer
router.get('/', protect, authorize('organizer', 'admin'), async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : 0;
        let query;
        if (req.user.role === 'admin') {
            query = Tournament.find().populate('teams').limit(limit);
        } else {
            query = Tournament.find({ organizer: req.user.id }).populate('teams').limit(limit);
        }
        const tournaments = await query;
        res.status(200).json({ success: true, count: tournaments.length, data: tournaments });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// ── @route   GET /api/tournaments/public
// ── @desc    Get all public tournaments for players to browse
// ── @access  Public
router.get('/public', async (req, res) => {
    try {
        // fetching tournaments that are created and maybe active/draft, returning basic info
        const tournaments = await Tournament.find()
            .populate('organizer', 'name email')
            .populate('teams')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: tournaments.length, data: tournaments });
    } catch (err) {
        console.error('Fetch Public Tournaments Error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// ── @route   GET /api/tournaments/stats
// ── @desc    Get dashboard stats for the logged-in organizer
// ── @access  Private/Organizer
// !! This route MUST be defined before /:id to avoid 'stats' being treated as an ID
router.get('/stats', protect, authorize('organizer', 'admin'), async (req, res) => {
    try {
        const filter = req.user.role === 'admin' ? {} : { organizer: req.user.id };

        const tournaments = await Tournament.find(filter).populate('teams');

        const totalTournaments = tournaments.length;
        const activeMatches = tournaments.filter(t => t.status === 'Active').length;

        // Deduplicate teams across all tournaments
        const teamIds = new Set();
        tournaments.forEach(t => t.teams.forEach(team => teamIds.add(team._id.toString())));

        res.status(200).json({
            success: true,
            data: {
                tournaments: totalTournaments,
                teams: teamIds.size,
                activeMatches,
                players: 0  // Extend later when Player model is added
            }
        });
    } catch (err) {
        console.error('Stats Error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// ── @route   GET /api/tournaments/:id
// ── @desc    Get single tournament
// ── @access  Public
router.get('/:id', async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id).populate('teams');
        if (!tournament) {
            return res.status(404).json({ success: false, message: 'Tournament not found' });
        }
        res.status(200).json({ success: true, data: tournament });
    } catch (err) {
        res.status(400).json({ success: false, message: 'Invalid ID' });
    }
});

// ── @route   PATCH /api/tournaments/:id/start
// ── @desc    Start a tournament
// ── @access  Private/Organizer
router.patch('/:id/start', protect, authorize('organizer', 'admin'), async (req, res) => {
    try {
        let tournament = await Tournament.findById(req.params.id);
        if (!tournament) {
            return res.status(404).json({ success: false, message: 'Tournament not found' });
        }

        // Check ownership
        if (tournament.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        tournament.status = 'Active';
        await tournament.save();

        const populatedTournament = await Tournament.findById(tournament._id).populate('teams');
        res.status(200).json({ success: true, data: populatedTournament });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// ── @route   POST /api/tournaments/:id/teams
// ── @desc    Add teams to a tournament
// ── @access  Private/Organizer
router.post('/:id/teams', protect, authorize('organizer', 'admin'), async (req, res) => {
    try {
        const { teamIds } = req.body;
        let tournament = await Tournament.findById(req.params.id);
        if (!tournament) {
            return res.status(404).json({ success: false, message: 'Tournament not found' });
        }

        // Add teams without duplicating
        teamIds.forEach(id => {
            if (!tournament.teams.includes(id)) {
                tournament.teams.push(id);
            }
        });

        await tournament.save();
        const populatedTournament = await Tournament.findById(tournament._id).populate('teams');
        res.status(200).json({ success: true, data: populatedTournament });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// ── @route   POST /api/tournaments/:id/join
// ── @desc    Player joins a tournament
// ── @access  Private/Player
router.post('/:id/join', protect, authorize('player', 'admin'), async (req, res) => {
    try {
        let tournament = await Tournament.findById(req.params.id);
        if (!tournament) {
            return res.status(404).json({ success: false, message: 'Tournament not found' });
        }

        // Add user to registeredPlayers without duplicating
        if (!tournament.registeredPlayers.includes(req.user.id)) {
            tournament.registeredPlayers.push(req.user.id);
            await tournament.save();
        } else {
            return res.status(400).json({ success: false, message: 'You have already joined this tournament' });
        }

        res.status(200).json({ success: true, data: tournament, message: 'Successfully joined the tournament!' });
    } catch (err) {
        console.error("Join Tournament Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
