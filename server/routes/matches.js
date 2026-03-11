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
            .populate('result.winningTeam', 'name')
            .sort({ date: 1 }); // Ascending order by date

        // Convert Mongoose Map objects to plain objects for JSON serialization
        const convertedMatches = matches.map(match => {
            const matchObj = match.toObject();
            
            // Convert playerStats Map to object
            if (match.playerStats && match.playerStats instanceof Map) {
                matchObj.playerStats = {};
                match.playerStats.forEach((value, key) => {
                    matchObj.playerStats[key] = value;
                });
            }

            // Convert superOverPlayerStats Map to object
            if (match.superOverPlayerStats && match.superOverPlayerStats instanceof Map) {
                matchObj.superOverPlayerStats = {};
                match.superOverPlayerStats.forEach((value, key) => {
                    matchObj.superOverPlayerStats[key] = value;
                });
            }

            return matchObj;
        });

        res.status(200).json({ success: true, count: convertedMatches.length, data: convertedMatches });
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
        const matches = await Match.find({ status: { $in: ['Scheduled', 'Live', 'Completed'] } })
            .populate('teamA', 'name logo')
            .populate('teamB', 'name logo')
            .populate('tournament', 'name status format')
            .populate('result.winningTeam', 'name')
            .sort({ status: -1, date: -1 }) // Live usually starts with L, Scheduled with S. 
            .limit(15);

        // Convert Mongoose Map objects to plain objects for JSON serialization
        const convertedMatches = matches.map(match => {
            const matchObj = match.toObject();
            
            // Convert playerStats Map to object
            if (match.playerStats && match.playerStats instanceof Map) {
                matchObj.playerStats = {};
                match.playerStats.forEach((value, key) => {
                    matchObj.playerStats[key] = value;
                });
            }

            // Convert superOverPlayerStats Map to object
            if (match.superOverPlayerStats && match.superOverPlayerStats instanceof Map) {
                matchObj.superOverPlayerStats = {};
                match.superOverPlayerStats.forEach((value, key) => {
                    matchObj.superOverPlayerStats[key] = value;
                });
            }

            return matchObj;
        });

        res.status(200).json({ success: true, count: convertedMatches.length, data: convertedMatches });
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
            .populate('activePlayers.bowler')
            .populate('result.winningTeam');

        if (!match) return res.status(404).json({ success: false, message: 'Match not found' });

        // Convert Mongoose Map objects to plain objects for JSON serialization
        const matchObj = match.toObject();
        
        // Convert playerStats Map to object
        if (match.playerStats && match.playerStats instanceof Map) {
            matchObj.playerStats = {};
            match.playerStats.forEach((value, key) => {
                matchObj.playerStats[key] = value;
            });
        }

        // Convert superOverPlayerStats Map to object
        if (match.superOverPlayerStats && match.superOverPlayerStats instanceof Map) {
            matchObj.superOverPlayerStats = {};
            match.superOverPlayerStats.forEach((value, key) => {
                matchObj.superOverPlayerStats[key] = value;
            });
        }

        res.status(200).json({ success: true, data: matchObj });
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

        // Convert Mongoose Map objects to plain objects for JSON serialization
        const matchObj = populatedMatch.toObject();
        
        // Convert playerStats Map to object
        if (populatedMatch.playerStats && populatedMatch.playerStats instanceof Map) {
            matchObj.playerStats = {};
            populatedMatch.playerStats.forEach((value, key) => {
                matchObj.playerStats[key] = value;
            });
        }

        // Convert superOverPlayerStats Map to object
        if (populatedMatch.superOverPlayerStats && populatedMatch.superOverPlayerStats instanceof Map) {
            matchObj.superOverPlayerStats = {};
            populatedMatch.superOverPlayerStats.forEach((value, key) => {
                matchObj.superOverPlayerStats[key] = value;
            });
        }

        res.status(200).json({ success: true, data: matchObj });
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

        // Convert Mongoose Map objects to plain objects for JSON serialization
        const matchObj = populatedMatch.toObject();
        
        // Convert playerStats Map to object
        if (populatedMatch.playerStats && populatedMatch.playerStats instanceof Map) {
            matchObj.playerStats = {};
            populatedMatch.playerStats.forEach((value, key) => {
                matchObj.playerStats[key] = value;
            });
        }

        // Convert superOverPlayerStats Map to object
        if (populatedMatch.superOverPlayerStats && populatedMatch.superOverPlayerStats instanceof Map) {
            matchObj.superOverPlayerStats = {};
            populatedMatch.superOverPlayerStats.forEach((value, key) => {
                matchObj.superOverPlayerStats[key] = value;
            });
        }

        res.status(200).json({ success: true, data: matchObj });
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
        const dataPath = match.isSuperOver ? match.superOver : match.score;

        // Update Score
        dataPath[inningKey].runs += (runs + extras);
        if (isWicket) {
            dataPath[inningKey].wickets += 1;
            if (playerDismissed) {
                if (!dataPath[inningKey].dismissedPlayers) {
                    dataPath[inningKey].dismissedPlayers = [];
                }
                if (!dataPath[inningKey].dismissedPlayers.includes(playerDismissed)) {
                    dataPath[inningKey].dismissedPlayers.push(playerDismissed);
                }
            }
        }

        // Overs format: 1.1, 1.2, ..., 1.5, 2.0
        if (updatedOverCount !== undefined) {
            dataPath[inningKey].overs = updatedOverCount;
        }

        if (match.isSuperOver) {
            match.markModified('superOver');
        } else {
            match.markModified('score');
        }

        // Initialize playerStats Map if not present
        if (!match.playerStats) {
            match.playerStats = new Map();
        }
        if (!match.superOverPlayerStats) {
            match.superOverPlayerStats = new Map();
        }

        // Select the correct stats object based on whether it's a super over
        const statsObject = match.isSuperOver ? match.superOverPlayerStats : match.playerStats;

        const ensureStats = (pName) => {
            if (pName && !statsObject.has(pName)) {
                statsObject.set(pName, {
                    batRuns: 0, batBalls: 0, batFours: 0, batSixes: 0,
                    isOut: false, dismissalType: null,
                    bowlRuns: 0, bowlBalls: 0, bowlWickets: 0, bowlMaidens: 0
                });
            }
        };

        const oldStriker = match.activePlayers.striker;
        const oldNonStriker = match.activePlayers.nonStriker;
        const oldBowler = match.activePlayers.bowler;

        ensureStats(oldStriker);
        ensureStats(oldNonStriker);
        ensureStats(oldBowler);

        const sStats = statsObject.get(oldStriker);
        const bStats = statsObject.get(oldBowler);

        // Batting stats
        if (extraType !== 'wd' && extraType !== 'nb') {
            sStats.batBalls += 1;
        }
        if (extraType !== 'wd' && extraType !== 'b' && extraType !== 'lb') {
            sStats.batRuns += runs;
            if (runs === 4) sStats.batFours += 1;
            if (runs === 6) sStats.batSixes += 1;
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

        if (isWicket) {
            if (wicketType !== 'run out') {
                bStats.bowlWickets += 1;
            }
            if (playerDismissed) {
                ensureStats(playerDismissed);
                const victimStats = statsObject.get(playerDismissed);
                if (victimStats) {
                    victimStats.isOut = true;
                    victimStats.dismissalType = wicketType || 'out';
                    statsObject.set(playerDismissed, victimStats);
                }
            }
        }

        statsObject.set(oldStriker, sStats);
        statsObject.set(oldBowler, bStats);

        // Mark the appropriate object as modified in Mongoose
        if (match.isSuperOver) {
            match.markModified('superOverPlayerStats');
        } else {
            match.markModified('playerStats');
        }

        // Update active players if provided
        if (striker) match.activePlayers.striker = striker;
        if (nonStriker) match.activePlayers.nonStriker = nonStriker;
        if (bowler) match.activePlayers.bowler = bowler;

        // Check for Match Completion
        if (match.isSuperOver) {
            const currentRuns = dataPath[inningKey].runs;
            const wickets = dataPath[inningKey].wickets;
            const oversPlayed = dataPath[inningKey].overs;
            const MAX_OVERS = 1.0;
            const MAX_WICKETS = 2; // Rule: 3 batsmen allowed, 2 wickets ends it

            if (match.currentInning === 2) {
                const target = match.target;
                if (currentRuns >= target) {
                    match.status = 'Completed';
                    match.result.winningTeam = match.battingTeam;
                    const wicketsLeft = MAX_WICKETS - wickets;
                    match.result.margin = `Won by ${wicketsLeft} wickets (Super Over)`;
                } else if (wickets >= MAX_WICKETS || oversPlayed >= MAX_OVERS) {
                    match.status = 'Completed';
                    if (currentRuns < target - 1) {
                        match.result.winningTeam = match.bowlingTeam;
                        match.result.margin = `Won by ${target - 1 - currentRuns} runs (Super Over)`;
                    } else {
                        match.result.margin = 'Super Over Tied';
                    }
                }
            } else {
                // Inning 1 of Super Over
                if (wickets >= MAX_WICKETS || oversPlayed >= MAX_OVERS) {
                    // Force inning complete message to frontend
                    // We'll handle target setter in switch-inning
                }
            }
        } else if (match.currentInning === 2) {
            const currentRuns = match.score.inning2.runs;
            const target = match.target;
            const wickets = match.score.inning2.wickets;
            const oversPlayed = match.score.inning2.overs;

            if (currentRuns >= target) {
                match.status = 'Completed';
                match.result.winningTeam = match.battingTeam;
                const wicketsLeft = 11 - wickets;
                match.result.margin = `Won by ${wicketsLeft} wickets`;
            } else if (wickets >= 10 || oversPlayed >= match.overs) {
                match.status = 'Completed';
                if (currentRuns < target - 1) {
                    match.result.winningTeam = match.bowlingTeam;
                    match.result.margin = `Won by ${target - 1 - currentRuns} runs`;
                } else {
                    match.result.margin = 'Match Tied';
                }
            }
        }

        await match.save();

        const populatedMatch = await Match.findById(match._id)
            .populate('teamA')
            .populate('teamB')
            .populate('battingTeam')
            .populate('bowlingTeam');

        // Convert Mongoose Map objects to plain objects for JSON serialization
        const matchObj = populatedMatch.toObject();
        
        // Convert playerStats Map to object
        if (populatedMatch.playerStats && populatedMatch.playerStats instanceof Map) {
            matchObj.playerStats = {};
            populatedMatch.playerStats.forEach((value, key) => {
                matchObj.playerStats[key] = value;
            });
        }

        // Convert superOverPlayerStats Map to object
        if (populatedMatch.superOverPlayerStats && populatedMatch.superOverPlayerStats instanceof Map) {
            matchObj.superOverPlayerStats = {};
            populatedMatch.superOverPlayerStats.forEach((value, key) => {
                matchObj.superOverPlayerStats[key] = value;
            });
        }

        const newBall = await Ball.create({
            match: matchId,
            inning: match.currentInning,
            isSuperOver: match.isSuperOver,
            over: Math.floor(dataPath[inningKey].overs),
            ball: Math.round((dataPath[inningKey].overs % 1) * 10),
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

        res.status(201).json({ success: true, data: { match: matchObj, ball: newBall } });
    } catch (err) {
        console.error("Score Error:", err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// ── @route   PATCH /api/matches/:id/switch-inning
// ── @desc    Transition from 1st to 2nd inning
// ── @access  Private/Organizer
router.patch('/matches/:id/switch-inning', protect, authorize('organizer', 'admin'), async (req, res) => {
    try {
        const match = await Match.findById(req.params.id);
        if (!match) return res.status(404).json({ success: false, message: 'Match not found' });

        if (match.currentInning !== 1) {
            return res.status(400).json({ success: false, message: 'Already in 2nd inning or match completed' });
        }

        const dataPath = match.isSuperOver ? match.superOver : match.score;

        // Set Target
        match.target = dataPath.inning1.runs + 1;
        match.currentInning = 2;

        // Swap batting and bowling teams
        const temp = match.battingTeam;
        match.battingTeam = match.bowlingTeam;
        match.bowlingTeam = temp;

        // Reset active players for selection
        match.activePlayers = { striker: null, nonStriker: null, bowler: null };

        await match.save();

        const populatedMatch = await Match.findById(match._id)
            .populate('teamA')
            .populate('teamB')
            .populate('battingTeam')
            .populate('bowlingTeam');

        // Convert Mongoose Map objects to plain objects for JSON serialization
        const matchObj = populatedMatch.toObject();
        
        // Convert playerStats Map to object
        if (populatedMatch.playerStats && populatedMatch.playerStats instanceof Map) {
            matchObj.playerStats = {};
            populatedMatch.playerStats.forEach((value, key) => {
                matchObj.playerStats[key] = value;
            });
        }

        // Convert superOverPlayerStats Map to object
        if (populatedMatch.superOverPlayerStats && populatedMatch.superOverPlayerStats instanceof Map) {
            matchObj.superOverPlayerStats = {};
            populatedMatch.superOverPlayerStats.forEach((value, key) => {
                matchObj.superOverPlayerStats[key] = value;
            });
        }

        res.status(200).json({ success: true, data: matchObj });
    } catch (err) {
        console.error("Switch Inning Error:", err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// ── @route   PATCH /api/matches/:id/start-super-over
// ── @desc    Initialize Super Over
// ── @access  Private/Organizer
router.patch('/matches/:id/start-super-over', protect, authorize('organizer', 'admin'), async (req, res) => {
    try {
        const match = await Match.findById(req.params.id);
        if (!match) return res.status(404).json({ success: false, message: 'Match not found' });
        if (match.result.margin !== 'Match Tied' || match.status !== 'Completed') {
            return res.status(400).json({ success: false, message: 'Match must be tied and completed to start Super Over' });
        }

        match.isSuperOver = true;
        match.currentInning = 1;
        match.status = 'Live';
        match.result = { winningTeam: null, margin: '' }; // Clear result

        // Rule: Team batting 2nd in main match bats 1st in Super Over
        // But battingTeam currently is the one who finished batting 2nd.
        // So we keep current battingTeam as Inning 1 batting team for Super Over.

        match.activePlayers = { striker: null, nonStriker: null, bowler: null };
        match.superOver = {
            inning1: { runs: 0, wickets: 0, overs: 0, dismissedPlayers: [] },
            inning2: { runs: 0, wickets: 0, overs: 0, dismissedPlayers: [] }
        };

        await match.save();

        const populatedMatch = await Match.findById(match._id)
            .populate('teamA')
            .populate('teamB')
            .populate('battingTeam')
            .populate('bowlingTeam');

        // Convert Mongoose Map objects to plain objects for JSON serialization
        const matchObj = populatedMatch.toObject();
        
        // Convert playerStats Map to object
        if (populatedMatch.playerStats && populatedMatch.playerStats instanceof Map) {
            matchObj.playerStats = {};
            populatedMatch.playerStats.forEach((value, key) => {
                matchObj.playerStats[key] = value;
            });
        }

        // Convert superOverPlayerStats Map to object
        if (populatedMatch.superOverPlayerStats && populatedMatch.superOverPlayerStats instanceof Map) {
            matchObj.superOverPlayerStats = {};
            populatedMatch.superOverPlayerStats.forEach((value, key) => {
                matchObj.superOverPlayerStats[key] = value;
            });
        }

        res.status(200).json({ success: true, data: matchObj });
    } catch (err) {
        console.error("Start Super Over Error:", err);
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

        // Convert Mongoose Map objects to plain objects for JSON serialization
        const matchObj = match.toObject();
        
        // Convert playerStats Map to object
        if (match.playerStats && match.playerStats instanceof Map) {
            matchObj.playerStats = {};
            match.playerStats.forEach((value, key) => {
                matchObj.playerStats[key] = value;
            });
        }

        // Convert superOverPlayerStats Map to object
        if (match.superOverPlayerStats && match.superOverPlayerStats instanceof Map) {
            matchObj.superOverPlayerStats = {};
            match.superOverPlayerStats.forEach((value, key) => {
                matchObj.superOverPlayerStats[key] = value;
            });
        }

        res.status(200).json({ success: true, data: matchObj });
    } catch (err) {
        console.error("Cancel Match Error:", err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;
