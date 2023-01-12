const express = require('express')
const session = require('express-session')
const router = express.Router()
const passport = require('passport')

const mongoose = require('../config/db')
const User = require('../models/user')

const GoogleStrategy = require("passport-google-oauth20").Strategy;
const keys = require("../oauth2.keys.json");


router.use(session({ secret: "SECRET", saveUninitialized: true, resave: true }));

// Set up middleware
router.use(express.urlencoded({ extended: false }));
router.use(express.json());

router.use(passport.initialize());
router.use(passport.session());


passport.use(new GoogleStrategy({
    clientID: keys.web.client_id,
    clientSecret: keys.web.client_secret,
    callbackURL: "http://127.0.0.1:3000/auth/google/callback",
}, (accessToken, refreshToken, profile, cb) =>  {
    // This function is called when the user grants or denies permission to access their account

    // Verify the hosted domain
    const email = profile.emails[0].value;
    const emailDomain = email.split('@')[1];

    if (emailDomain != 'stu.cu.edu.ng') {
        console.log('Invalid email, Please Use your Covenant University Student Email')
        return cb(null, false, { message: 'Invalid email, Please Use your Covenant University Student Email' });
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
        scope: ["profile", "email"], hostedDomain: 'stu.cu.edu.ng'
    })
);

router.get("/auth/google/callback", passport.authenticate("google", {
		successRedirect: "/",
		failureRedirect: "/auth/google?error=Access+Denied",
	})
);

module.exports = router