const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
    tournament: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tournament',
        required: true
    },
    teamA: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },
    teamB: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    venue: {
        type: String,
        trim: true,
        default: 'TBD'
    },
    status: {
        type: String,
        enum: ['Scheduled', 'Live', 'Completed'],
        default: 'Scheduled'
    },
    toss: {
        wonBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Team',
            default: null
        },
        decision: {
            type: String,
            enum: ['Bat', 'Bowl', null],
            default: null
        }
    },
    result: {
        winningTeam: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Team',
            default: null
        },
        margin: {
            type: String,
            default: ''
        }
    },
    // ---- Live Scoring Data ----
    overs: {
        type: Number,
        default: 20 // Default T20 length
    },
    currentInning: {
        type: Number,
        default: 1,
        enum: [1, 2]
    },
    battingTeam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        default: null
    },
    bowlingTeam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        default: null
    },
    score: {
        inning1: {
            runs: { type: Number, default: 0 },
            wickets: { type: Number, default: 0 },
            overs: { type: Number, default: 0 }, // Track decimal overs like 1.2
            dismissedPlayers: [{ type: String }]
        },
        inning2: {
            runs: { type: Number, default: 0 },
            wickets: { type: Number, default: 0 },
            overs: { type: Number, default: 0 },
            dismissedPlayers: [{ type: String }]
        }
    },
    target: {
        type: Number,
        default: 0
    },
    activePlayers: {
        striker: { type: String, default: null },
        nonStriker: { type: String, default: null },
        bowler: { type: String, default: null }
    },
    playerStats: {
        type: Map,
        of: new mongoose.Schema({
            batRuns: { type: Number, default: 0 },
            batBalls: { type: Number, default: 0 },
            bowlRuns: { type: Number, default: 0 },
            bowlBalls: { type: Number, default: 0 },
            bowlWickets: { type: Number, default: 0 }
        }, { _id: false }),
        default: {}
    }
}, { timestamps: true });

module.exports = mongoose.model('Match', MatchSchema);
