const passport = require('passport');
const FacebookStrategy = require('../auth/facebook/index').Strategy;
const mongoose = require('mongoose');
const got = require('got');
const User = require('../models/User');
const _url = 'https://graph.facebook.com/{USERID}?fields={FIELDS}&access_token={TOKEN}';
const _fields = 'id,name,email,picture,hometown,birthday';
const _options = 'GET';


passport.use(new FacebookStrategy({
        usernameField: 'userID',
        passwordField: 'accessToken'
    },
    async(userID, accessToken, done) => {
        const data = await getFacebookData({ 'accessToken': accessToken, 'userID': userID });
        var user = await User.findOne({ userID: data.id });
        if (!user) {
            let newUser = new User({
                name: data.name,
                email: data.email || "mail@mail.com",
                userID: data.id,
                pictureUrl: data.picture.data.url,
                saldo: 0,
                credito: 100
            });
            newUser.password = await newUser.encryptPassword(data.email || "mail@mail.com");
            await newUser.save();
            return done(null, newUser);

        } else {
            user.pictureUrl = data.picture.data.url || "./img/user-avatar-contact-portfolio-personal-portrait-profile-6-5623.png";
            await user.save();
            return done(null, user);

        }

    }));

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});


async function getFacebookData(data) {
    var url = _url.replace('{USERID}', data.userID);
    url = url.replace('{FIELDS}', _fields);
    url = url.replace('{TOKEN}', data.accessToken);
    try {
        const response = await got(url).json();
        return response;

    } catch (error) {
        return error;
    }
};