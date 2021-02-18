const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const mongoose = require('mongoose');
const got = require('got');
const User = require('../models/User');
const _url = 'https://graph.facebook.com/{USERID}?fields={FIELDS}&access_token={TOKEN}';
const _fields = 'id,name,email,picture,hometown,birthday';
const _options = 'GET';


passport.use(new FacebookStrategy({
        clientID: '255378138964948',
        clientSecret: 'c6f954007adc43ccf6bffd7b96434c81',
        callbackURL: "https://localhost:4000/user/facebook/callback",
        graphAPIVersion: 'v6.0',
        profileURL: _url,
        profileFields: _fields
    },
    function(accessToken, refreshToken, profile, cb) {

        console.log(profile)
        User.findOrCreate({ facebookId: profile.id }, function(err, user) {
            return cb(err, user);
        });
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

function parseUrl(data) {
    var url = _url.replace('{USERID}', data.userID);
    url = url.replace('{FIELDS}', _fields);
    url = url.replace('{TOKEN}', data.accessToken);
    return url
};

async function getFacebookData(url) {
    try {
        const response = await got(url).json();
        return response;

    } catch (error) {
        return error.response.body;
    }
};;