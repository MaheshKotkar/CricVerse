const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Tournament = require('../models/Tournament');
const Team = require('../models/Team');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

// All admin routes require authentication and admin role
router.use(protect, authorize('admin'));

// ─────────────────────────────────────────────
// STATS
// ─────────────────────────────────────────────
// GET /api/admin/stats
router.get('/stats', async (req, res) => {
    try {
        const [totalUsers, totalTournaments, totalTeams, activeTournaments] = await Promise.all([
            User.countDocuments(),
            Tournament.countDocuments(),
            Team.countDocuments(),
            Tournament.countDocuments({ status: 'Active' }),
        ]);
        res.json({ success: true, data: { totalUsers, totalTournaments, totalTeams, activeTournaments } });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// ─────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────
// GET /api/admin/users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json({ success: true, count: users.length, data: users });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// PUT /api/admin/users/:id  - Update user role
router.put('/users/:id', async (req, res) => {
    try {
        const { name, role } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { name, role },
            { new: true, runValidators: true }
        ).select('-password');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
    try {
        if (req.params.id === req.user.id) {
            return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
        }
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// ─────────────────────────────────────────────
// TOURNAMENTS
// ─────────────────────────────────────────────
// GET /api/admin/tournaments
router.get('/tournaments', async (req, res) => {
    try {
        const tournaments = await Tournament.find()
            .populate('organizer', 'name email')
            .populate('teams', 'name')
            .sort({ createdAt: -1 });
        res.json({ success: true, count: tournaments.length, data: tournaments });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// PUT /api/admin/tournaments/:id
router.put('/tournaments/:id', async (req, res) => {
    try {
        const { name, format, status, venue, startDate, endDate, description } = req.body;
        const tournament = await Tournament.findByIdAndUpdate(
            req.params.id,
            { name, format, status, venue, startDate, endDate, description },
            { new: true, runValidators: true }
        ).populate('organizer', 'name email');
        if (!tournament) return res.status(404).json({ success: false, message: 'Tournament not found' });
        res.json({ success: true, data: tournament });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE /api/admin/tournaments/:id
router.delete('/tournaments/:id', async (req, res) => {
    try {
        const tournament = await Tournament.findByIdAndDelete(req.params.id);
        if (!tournament) return res.status(404).json({ success: false, message: 'Tournament not found' });
        res.json({ success: true, message: 'Tournament deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// ─────────────────────────────────────────────
// TEAMS
// ─────────────────────────────────────────────
// GET /api/admin/teams
router.get('/teams', async (req, res) => {
    try {
        const teams = await Team.find()
            .populate('organizer', 'name email')
            .sort({ createdAt: -1 });
        res.json({ success: true, count: teams.length, data: teams });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// DELETE /api/admin/teams/:id
router.delete('/teams/:id', async (req, res) => {
    try {
        const team = await Team.findByIdAndDelete(req.params.id);
        if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
        res.json({ success: true, message: 'Team deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;
