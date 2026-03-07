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
    }
}, { timestamps: true });

module.exports = mongoose.model('Match', MatchSchema);
