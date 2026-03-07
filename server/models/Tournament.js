const mongoose = require('mongoose');

const TournamentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Tournament name is required'],
        trim: true,
        maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    format: {
        type: String,
        required: [true, 'Tournament format is required'],
        enum: ['T20', 'ODI', 'Test'],
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required'],
    },
    endDate: {
        type: Date,
    },
    venue: {
        type: String,
        trim: true,
    },
    status: {
        type: String,
        enum: ['Draft', 'Active', 'Completed'],
        default: 'Draft',
    },
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    teams: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
    }],
    registeredPlayers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    description: {
        type: String,
        trim: true,
    }
}, { timestamps: true });

module.exports = mongoose.model('Tournament', TournamentSchema);
