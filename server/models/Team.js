const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Team name is required'],
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    logo: {
        type: String,
        default: '',
    },
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    players: [{
        name: {
            type: String,
            required: true,
            trim: true,
        },
        role: {
            type: String,
            enum: ['Batsman', 'Bowler', 'All-rounder', 'Wicket-keeper'],
        },
        isCaptain: {
            type: Boolean,
            default: false
        },
        isViceCaptain: {
            type: Boolean,
            default: false
        }
    }],
}, { timestamps: true });

module.exports = mongoose.model('Team', TeamSchema);
