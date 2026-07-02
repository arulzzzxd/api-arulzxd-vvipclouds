const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const crypto = require('crypto');
const User = require('../models/User');

// Konfigurasi Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || "MASUKKAN_GOOGLE_CLIENT_ID",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "MASUKKAN_GOOGLE_CLIENT_SECRET",
    callbackURL: "/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let email = profile.emails[0].value;
        let user = await User.findOne({ email: email });

        if (!user) {
            user = await User.create({
                name: profile.displayName,
                email: email,
                provider: 'google',
                providerId: profile.id,
                apikey: 'arulz-' + crypto.randomBytes(4).toString('hex')
            });
        }
        return done(null, user);
    } catch (err) {
        return done(err, null);
    }
}));

// Konfigurasi GitHub Strategy
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID || "MASUKKAN_GITHUB_CLIENT_ID",
    clientSecret: process.env.GITHUB_CLIENT_SECRET || "MASUKKAN_GITHUB_CLIENT_SECRET",
    callbackURL: "/api/auth/github/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let email = profile.emails && profile.emails[0] ? profile.emails[0].value : `${profile.username}@github.com`;
        let user = await User.findOne({ email: email });

        if (!user) {
            user = await User.create({
                name: profile.displayName || profile.username,
                email: email,
                provider: 'github',
                providerId: profile.id,
                apikey: 'arulz-' + crypto.randomBytes(4).toString('hex')
            });
        }
        return done(null, user);
    } catch (err) {
        return done(err, null);
    }
}));
