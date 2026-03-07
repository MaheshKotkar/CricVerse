const express = require('express');
const router = express.Router();
const Match = require('../models/Match');
const Tournament = require('../models/Tournament');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

// ── @route   POST /api/tournaments/:tournamentId/matches
// ── @desc    Create a new match for a specific tournament
// ── @access  Private/Organizer
router.post('/tournaments/:tournamentId/matches', protect, authorize('organizer', 'admin'), async (req, res) => {
    try {
        const { teamA, teamB, date, venue } = req.body;
        const { tournamentId } = req.params;

        // Ensure tournament exists and the user owns it
        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) {
            return res.status(404).json({ success: false, message: 'Tournament not found' });
        }

        if (tournament.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to modify this tournament' });
        }

        // Validate teams are different
        if (teamA === teamB) {
            return res.status(400).json({ success: false, message: 'A team cannot play against itself' });
        }

        // Validate both teams are registered in the tournament
        const isTeamARegistered = tournament.teams.includes(teamA);
        const isTeamBRegistered = tournament.teams.includes(teamB);

        if (!isTeamARegistered || !isTeamBRegistered) {
            return res.status(400).json({ success: false, message: 'Both teams must be registered in the tournament' });
        }

        // Create match
        const match = await Match.create({
            tournament: tournamentId,
            teamA,
            teamB,
            date,
            venue: venue || tournament.venue || 'TBD',
            status: 'Scheduled'
        });

        const populatedMatch = await Match.findById(match._id)
            .populate('teamA', 'name logo')
            .populate('teamB', 'name logo');

        res.status(201).json({ success: true, data: populatedMatch });

    } catch (err) {
        console.error("Create Match Error:", err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// ── @route   GET /api/tournaments/:tournamentId/matches
// ── @desc    Get all matches for a specific tournament
// ── @access  Public (or Private depending on requirements, usually public to view)
router.get('/tournaments/:tournamentId/matches', async (req, res) => {
    try {
        const matches = await Match.find({ tournament: req.params.tournamentId })
            .populate('teamA', 'name logo')
            .populate('teamB', 'name logo')
            .sort({ date: 1 }); // Ascending order by date

        res.status(200).json({ success: true, count: matches.length, data: matches });
    } catch (err) {
        console.error("Fetch Matches Error:", err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// ── @route   GET /api/matches/upcoming
// ── @desc    Get upcoming and live matches across all active tournaments
// ── @access  Public
router.get('/matches/upcoming', async (req, res) => {
    try {
        const matches = await Match.find({ status: { $in: ['Scheduled', 'Live'] } })
            .populate('teamA', 'name logo')
            .populate('teamB', 'name logo')
            .populate('tournament', 'name status format')
            .sort({ date: 1 })
            .limit(10); // get next 10 matches

        res.status(200).json({ success: true, count: matches.length, data: matches });
    } catch (err) {
        console.error("Fetch Upcoming Matches Error:", err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;
