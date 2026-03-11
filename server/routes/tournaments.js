const express = require('express');
const router = express.Router();
const Tournament = require('../models/Tournament');
const Match = require('../models/Match');
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

// ── @route   GET /api/tournaments/:id/points-table
// ── @desc    Calculate and return points table for a tournament
// ── @access  Public
router.get('/:id/points-table', async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.id).populate('teams');
        if (!tournament) return res.status(404).json({ success: false, message: 'Tournament not found' });

        const matches = await Match.find({ tournament: req.params.id, status: 'Completed' });

        const table = {};
        tournament.teams.forEach(team => {
            table[team._id.toString()] = {
                teamId: team._id,
                name: team.name,
                logo: team.logo,
                played: 0,
                won: 0,
                lost: 0,
                tied: 0,
                points: 0,
                runsScored: 0,
                ballsFaced: 0,
                runsConceded: 0,
                ballsBowled: 0,
                nrr: 0
            };
        });

        const convertToBalls = (overs) => {
            const fullOvers = Math.floor(overs);
            const balls = Math.round((overs % 1) * 10);
            return (fullOvers * 6) + balls;
        };

        matches.forEach(match => {
            const teamAId = match.teamA.toString();
            const teamBId = match.teamB.toString();

            // 1. Update Win/Loss/Points
            if (match.result.winningTeam) {
                const winnerId = match.result.winningTeam.toString();
                const loserId = winnerId === teamAId ? teamBId : teamAId;

                if (table[winnerId]) {
                    table[winnerId].played++;
                    table[winnerId].won++;
                    table[winnerId].points += 2;
                }
                if (table[loserId]) {
                    table[loserId].played++;
                    table[loserId].lost++;
                }
            } else if (match.result.margin === 'Match Tied' || match.result.margin === 'Super Over Tied') {
                if (table[teamAId]) {
                    table[teamAId].played++;
                    table[teamAId].tied++;
                    table[teamAId].points += 1;
                }
                if (table[teamBId]) {
                    table[teamBId].played++;
                    table[teamBId].tied++;
                    table[teamBId].points += 1;
                }
            }

            // 2. NRR Stats
            // Determine who batted 1st and 2nd
            let inning1TeamId, inning2TeamId;
            const tossWinnerId = match.toss.wonBy.toString();
            const tossDecision = match.toss.decision;

            if (tossDecision === 'Bat') {
                inning1TeamId = tossWinnerId;
                inning2TeamId = tossWinnerId === teamAId ? teamBId : teamAId;
            } else {
                inning2TeamId = tossWinnerId;
                inning1TeamId = tossWinnerId === teamAId ? teamBId : teamAId;
            }

            const i1Score = match.score.inning1;
            const i2Score = match.score.inning2;

            if (table[inning1TeamId] && table[inning2TeamId]) {
                // Inning 1 Team stats
                table[inning1TeamId].runsScored += i1Score.runs;
                table[inning1TeamId].ballsFaced += (i1Score.wickets === 10) ? (match.overs * 6) : convertToBalls(i1Score.overs);
                table[inning1TeamId].runsConceded += i2Score.runs;
                table[inning1TeamId].ballsBowled += (i2Score.wickets === 10) ? (match.overs * 6) : convertToBalls(i2Score.overs);

                // Inning 2 Team stats
                table[inning2TeamId].runsScored += i2Score.runs;
                table[inning2TeamId].ballsFaced += (i2Score.wickets === 10) ? (match.overs * 6) : convertToBalls(i2Score.overs);
                table[inning2TeamId].runsConceded += i1Score.runs;
                table[inning2TeamId].ballsBowled += (i1Score.wickets === 10) ? (match.overs * 6) : convertToBalls(i1Score.overs);
            }
        });

        // 3. Final NRR Calculation and Ranking
        const result = Object.values(table).map(team => {
            const oversFaced = team.ballsFaced / 6;
            const oversBowled = team.ballsBowled / 6;

            const runRateFor = oversFaced > 0 ? (team.runsScored / oversFaced) : 0;
            const runRateAgainst = oversBowled > 0 ? (team.runsConceded / oversBowled) : 0;

            team.nrr = parseFloat((runRateFor - runRateAgainst).toFixed(3));
            return team;
        });

        // Sort: Points (Desc), then NRR (Desc)
        result.sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            return b.nrr - a.nrr;
        });

        res.status(200).json({ success: true, data: result });
    } catch (err) {
        console.error("Points Table Error:", err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;
