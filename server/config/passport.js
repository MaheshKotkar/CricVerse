const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: '/api/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if user already exists with this Google ID
                let user = await User.findOne({ googleId: profile.id });

                if (user) {
                    return done(null, user);
                }

                // Check if email already exists (user registered normally before)
                const email = profile.emails && profile.emails[0]?.value;
                if (email) {
                    user = await User.findOne({ email });
                    if (user) {
                        // Link Google ID to existing account
                        user.googleId = profile.id;
                        if (!user.avatar && profile.photos?.[0]?.value) {
                            user.avatar = profile.photos[0].value;
                        }
                        await user.save();
                        return done(null, user);
                    }
                }

                // Create new user from Google profile
                user = await User.create({
                    name: profile.displayName,
                    email: email || `google_${profile.id}@cricverse.app`,
                    googleId: profile.id,
                    avatar: profile.photos?.[0]?.value || '',
                });

                return done(null, user);
            } catch (err) {
                return done(err, null);
            }
        }
    )
);
