const express = require('express');
const router = express.Router();
const Match = require('../models/Match');
const Tournament = require('../models/Tournament');
const Ball = require('../models/Ball');
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

// ── @route   GET /api/matches/:id
// ── @desc    Get a single match by ID with populated data
// ── @access  Public
router.get('/matches/:id', async (req, res) => {
    try {
        const match = await Match.findById(req.params.id)
            .populate('teamA')
            .populate('teamB')
            .populate('tournament')
            .populate('toss.wonBy')
            .populate('battingTeam')
            .populate('bowlingTeam')
            .populate('activePlayers.striker')
            .populate('activePlayers.nonStriker')
            .populate('activePlayers.bowler');

        if (!match) return res.status(404).json({ success: false, message: 'Match not found' });

        res.status(200).json({ success: true, data: match });
    } catch (err) {
        console.error("Get Match Error:", err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// ── @route   PATCH /api/matches/:id/start
// ── @desc    Start the match, set toss, active players, and make it Live
// ── @access  Private/Organizer
router.patch('/matches/:id/start', protect, authorize('organizer', 'admin'), async (req, res) => {
    try {
        const { tossWonBy, tossDecision, striker, nonStriker, bowler, overs } = req.body;
        const match = await Match.findById(req.params.id);

        if (!match) return res.status(404).json({ success: false, message: 'Match not found' });

        // Set Toss and Match Length
        match.toss = { wonBy: tossWonBy, decision: tossDecision };
        match.overs = overs || 20;

        // Determine Batting and Bowling Teams
        // If toss winner chose Bat, they are battingTeam. Else, bowlingTeam.
        const tossWinnerIsTeamA = match.teamA.toString() === tossWonBy;
        if (tossDecision === 'Bat') {
            match.battingTeam = tossWonBy;
            match.bowlingTeam = tossWinnerIsTeamA ? match.teamB : match.teamA;
        } else {
            match.bowlingTeam = tossWonBy;
            match.battingTeam = tossWinnerIsTeamA ? match.teamB : match.teamA;
        }

        match.status = 'Live';
        match.currentInning = 1;
        match.activePlayers = { striker, nonStriker, bowler };

        await match.save();

        const populatedMatch = await Match.findById(match._id)
            .populate('battingTeam')
            .populate('bowlingTeam');

        res.status(200).json({ success: true, data: populatedMatch });
    } catch (err) {
        console.error("Start Match Error:", err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// ── @route   PATCH /api/matches/:id/players
// ── @desc    Update active players (striker, nonStriker, bowler)
// ── @access  Private/Organizer
router.patch('/matches/:id/players', protect, authorize('organizer', 'admin'), async (req, res) => {
    try {
        const { striker, nonStriker, bowler } = req.body;
        const match = await Match.findById(req.params.id);

        if (!match) return res.status(404).json({ success: false, message: 'Match not found' });

        if (striker !== undefined) match.activePlayers.striker = striker;
        if (nonStriker !== undefined) match.activePlayers.nonStriker = nonStriker;
        if (bowler !== undefined) match.activePlayers.bowler = bowler;

        await match.save();

        const populatedMatch = await Match.findById(match._id)
            .populate('teamA')
            .populate('teamB')
            .populate('battingTeam')
            .populate('bowlingTeam');

        res.status(200).json({ success: true, data: populatedMatch });
    } catch (err) {
        console.error("Update Players Error:", err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// ── @route   POST /api/matches/:id/score
// ── @desc    Add a ball to the match and update score
// ── @access  Private/Organizer
router.post('/matches/:id/score', protect, authorize('organizer', 'admin'), async (req, res) => {
    try {
        const matchId = req.params.id;
        const { runs, extras, extraType, isWicket, wicketType, playerDismissed, updatedOverCount, striker, nonStriker, bowler } = req.body;

        const match = await Match.findById(matchId);
        if (!match || match.status !== 'Live') {
            return res.status(400).json({ success: false, message: 'Match not found or not Live' });
        }

        const inningKey = match.currentInning === 1 ? 'inning1' : 'inning2';

        // Update Score
        match.score[inningKey].runs += (runs + extras);
        if (isWicket) {
            match.score[inningKey].wickets += 1;
            if (playerDismissed) {
                if (!match.score[inningKey].dismissedPlayers) {
                    match.score[inningKey].dismissedPlayers = [];
                }
                if (!match.score[inningKey].dismissedPlayers.includes(playerDismissed)) {
                    match.score[inningKey].dismissedPlayers.push(playerDismissed);
                    match.markModified('score');
                }
            }
        }

        // Overs format: 1.1, 1.2, ..., 1.5, 2.0
        if (updatedOverCount !== undefined) {
            match.score[inningKey].overs = updatedOverCount;
        }

        // Initialize playerStats Map if not present
        if (!match.playerStats) {
            match.playerStats = new Map();
        }

        const ensureStats = (pName) => {
            if (pName && !match.playerStats.has(pName)) {
                match.playerStats.set(pName, { batRuns: 0, batBalls: 0, bowlRuns: 0, bowlBalls: 0, bowlWickets: 0 });
            }
        };

        const oldStriker = match.activePlayers.striker;
        const oldNonStriker = match.activePlayers.nonStriker;
        const oldBowler = match.activePlayers.bowler;

        ensureStats(oldStriker);
        ensureStats(oldNonStriker);
        ensureStats(oldBowler);

        const sStats = match.playerStats.get(oldStriker);
        const bStats = match.playerStats.get(oldBowler);

        // Batting stats
        // A batsman faces a ball on legal deliveries, byes, and leg-byes. Wides and No-balls do not count as a ball faced.
        if (extraType !== 'wd' && extraType !== 'nb') {
            sStats.batBalls += 1;
        }
        // Runs from the bat are only added if it's not any kind of extra (or if it's a no-ball where the batsman hits the ball, the runs hit off the bat count, but the team gets +1 extra for the NB. In this simple engine, `runs` represents runs off the bat, `extras` represents penalty. So we add `runs` to batsman even on a No Ball).
        if (extraType !== 'wd' && extraType !== 'b' && extraType !== 'lb') {
            sStats.batRuns += runs;
        }

        // Bowling stats
        if (!extraType || extraType === 'lb' || extraType === 'b') {
            bStats.bowlBalls += 1;
        }

        if (extraType === 'wd' || extraType === 'nb') {
            bStats.bowlRuns += (runs + extras);
        } else if (!extraType) {
            bStats.bowlRuns += runs;
        }

        if (isWicket && wicketType !== 'run out') {
            bStats.bowlWickets += 1;
        }

        match.playerStats.set(oldStriker, sStats);
        match.playerStats.set(oldBowler, bStats);

        // Update active players if provided (for rotation or new bowler)
        if (striker) match.activePlayers.striker = striker;
        if (nonStriker) match.activePlayers.nonStriker = nonStriker;
        if (bowler) match.activePlayers.bowler = bowler;

        await match.save();

        const populatedMatch = await Match.findById(match._id)
            .populate('teamA')
            .populate('teamB')
            .populate('battingTeam')
            .populate('bowlingTeam');

        const newBall = await Ball.create({
            match: matchId,
            inning: match.currentInning,
            over: Math.floor(match.score[inningKey].overs), // Using integer over for simple grouping
            ball: Math.round((match.score[inningKey].overs % 1) * 10), // The decimal part (1 to 6)
            bowler: match.activePlayers.bowler,
            striker: match.activePlayers.striker,
            nonStriker: match.activePlayers.nonStriker,
            runs,
            extras,
            extraType,
            isWicket,
            wicketType,
            playerDismissed
        });

        res.status(201).json({ success: true, data: { match: populatedMatch, ball: newBall } });
    } catch (err) {
        console.error("Score Error:", err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// ── @route   PATCH /api/matches/:id/cancel
// ── @desc    Cancel a match
// ── @access  Private/Organizer
router.patch('/matches/:id/cancel', protect, authorize('organizer', 'admin'), async (req, res) => {
    try {
        const { reason } = req.body;
        const match = await Match.findById(req.params.id);

        if (!match) return res.status(404).json({ success: false, message: 'Match not found' });

        match.status = 'Cancelled';
        match.cancelReason = reason || 'No specific reason provided';
        await match.save();

        res.status(200).json({ success: true, data: match });
    } catch (err) {
        console.error("Cancel Match Error:", err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;
