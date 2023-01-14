const express = require('express')
const session = require('express-session')
const router = express.Router()
const passport = require('passport')

const mongoose = require('../config/db')
const User = require('../models/user')

const GoogleStrategy = require("passport-google-oauth20").Strategy;

// Define a centralized error-handling function
function handleError(err, req, res, next) {
    if (err.message === 'Invalid hosted domain') {
        return res.status(401).json({
            success: false,
            message: 'Invalid Email, Please use a Covenant University Student Email'
        });
    } else if(err.message === 'Authentication failed, please try again') {
        return res.status(401).json({
            success: false,
            message: 'Authentication failed, please try again'
        });
    } else {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: 'An error occurred, please try again later'
        });
    }
}

// Set up middleware
router.use(session({ secret: process.env.session_secret, saveUninitialized: true, resave: true }));
router.use(passport.initialize());
router.use(passport.session());

passport.use(new GoogleStrategy({
    clientID: process.env.client_id,
    clientSecret: process.env.client_secret,
    callbackURL: "http://127.0.0.1:3000/auth/google/callback",
}, (accessToken, refreshToken, profile, cb) =>  {
    // This function is called when the user grants or denies permission to access their account

    // Verify the hosted domain
    const email = profile.emails[0].value;
    const emailDomain = email.split('@')[1];

    if (emailDomain != process.env.hosted_domain) {
        return cb(new Error('Invalid hosted domain'));
    }

    User.findOne({ googleId: profile.id }, (err, user) => {
        if (err) {
            return cb(err);
        }
        if (user) {
            return cb(null, user);
        }
        const newUser = new User({
            googleId: profile.id,
            email: profile.emails[0].value,
            displayName: profile.displayName,
        });
        newUser.save((err) => {
            if (err) {
                return cb(err);
            }
            return cb(null, newUser);
        });
    });
}));


passport.serializeUser(function (user, cb) {
	// This function is called when the user data needs to be serialized and stored in the session
	cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
	// This function is called when the user data needs to be deserialized and returned to the request
	cb(null, obj);
});


// Set up the login route
router.get("/auth/google",passport.authenticate("google", {
        scope: ["profile", "email"], hostedDomain: process.env.hosted_domain
    })
);

router.get("/auth/google/callback", passport.authenticate("google", {
		successRedirect: "/",
		failureRedirect: "/auth/google",
	})
);

router.use(handleError);

module.exports = router