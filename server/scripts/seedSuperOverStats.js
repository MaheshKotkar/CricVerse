const mongoose = require('mongoose');
require('dotenv').config();

// Load all models
const Match = require('../models/Match');
const Team = require('../models/Team');
const User = require('../models/User');
const Tournament = require('../models/Tournament');
const Ball = require('../models/Ball');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', (err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

db.once('open', async () => {
    console.log('Connected to MongoDB');
    try {
        // Find all matches with super over
        const matches = await Match.find({ isSuperOver: true }).populate('teamA teamB battingTeam bowlingTeam');

        console.log(`Found ${matches.length} matches with super over`);

        for (const match of matches) {
            console.log(`\nProcessing match: ${match.teamA.name} vs ${match.teamB.name}`);

            // Force generate new super over stats
            const superOverStats = new Map();

            // Get players from both teams that participated in super over
            const battingTeam = match.battingTeam;
            const bowlingTeam = match.bowlingTeam;

            // Generate realistic super over stats for batting team (3 batsmen)
            if (battingTeam && battingTeam.players) {
                const batsmens = battingTeam.players.slice(0, 3);
                
                batsmens.forEach((player, index) => {
                    const stats = {
                        batRuns: Math.floor(Math.random() * 25), // 0-25 runs in super over
                        batBalls: Math.floor(Math.random() * 6) + 1, // 1-6 balls
                        batFours: Math.floor(Math.random() * 3), // 0-2 fours
                        batSixes: Math.floor(Math.random() * 2), // 0-1 sixes
                        isOut: Math.random() > 0.6, // 40% chance of getting out
                        dismissalType: Math.random() > 0.7 ? 'caught' : (Math.random() > 0.5 ? 'bowled' : null),
                        bowlRuns: 0,
                        bowlBalls: 0,
                        bowlWickets: 0,
                        bowlMaidens: 0
                    };
                    superOverStats.set(player.name, stats);
                    console.log(`  Batter: ${player.name} - ${stats.batRuns} runs off ${stats.batBalls} balls`);
                });
            }

            // Generate realistic super over stats for bowling team (2 bowlers)
            if (bowlingTeam && bowlingTeam.players) {
                const bowlers = bowlingTeam.players.slice(0, 2);
                
                bowlers.forEach((player) => {
                    const existingStats = superOverStats.get(player.name);
                    const stats = {
                        ...(existingStats || { batRuns: 0, batBalls: 0, batFours: 0, batSixes: 0, isOut: false, dismissalType: null }),
                        bowlRuns: Math.floor(Math.random() * 20), // 0-20 runs conceded
                        bowlBalls: 6, // Full over
                        bowlWickets: Math.floor(Math.random() * 2), // 0-1 wickets
                        bowlMaidens: Math.random() > 0.7 ? 1 : 0 // 30% chance of maiden
                    };
                    superOverStats.set(player.name, stats);
                    console.log(`  Bowler: ${player.name} - ${stats.bowlRuns} runs, ${stats.bowlWickets} wickets`);
                });
            }

            // Force update match with super over stats
            match.superOverPlayerStats = superOverStats;
            await match.save();
            console.log(`✅ Updated super over stats for ${match.teamA.name} vs ${match.teamB.name}`);
        }

        console.log(`\n✅ Seed script completed successfully!`);
        process.exit(0);
    } catch (err) {
        console.error('Error seeding database:', err);
        process.exit(1);
    }
});
