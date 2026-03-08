const mongoose = require('mongoose');

const BallSchema = new mongoose.Schema({
    match: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Match',
        required: true,
        index: true
    },
    inning: {
        type: Number,
        required: true,
        enum: [1, 2] // 1st innings or 2nd innings
    },
    isSuperOver: {
        type: Boolean,
        default: false
    },
    over: {
        type: Number, // Example: 1 (for the 1st over), 2, etc.
        required: true
    },
    ball: {
        type: Number, // Example: 1 to 6 (or more if extras)
        required: true
    },
    bowler: {
        type: String,
        required: true
    },
    striker: {
        type: String,
        required: true
    },
    nonStriker: {
        type: String,
        required: true
    },
    runs: {
        type: Number, // Runs off the bat (0, 1, 2, 3, 4, 6)
        default: 0
    },
    extras: {
        type: Number, // Extra runs (wides, no-balls)
        default: 0
    },
    extraType: {
        type: String,
        enum: ['wd', 'nb', 'b', 'lb', null],
        default: null
    },
    isWicket: {
        type: Boolean,
        default: false
    },
    wicketType: {
        type: String,
        enum: ['bowled', 'caught', 'lbw', 'run out', 'stumped', 'hit wicket', null],
        default: null
    },
    playerDismissed: {
        type: String,
        default: null
    }
}, { timestamps: true });

// We could add a compound index on match and timestamp or over/ball to order them easily.
BallSchema.index({ match: 1, inning: 1, over: 1, ball: 1 });

module.exports = mongoose.model('Ball', BallSchema);
