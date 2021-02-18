const router = require('express').Router();
const passport = require('passport');
const Usercache = require('../models/UserCache');

// Models
const User = require('../models/User');

// Helpers
const { isAuthenticated } = require('../helpers/auth');

router.post('/users/new-user', isAuthenticated, async(req, res) => {
    if (req.file != null) {
        req.body.img = '/uploads/' + req.file.filename;
    }
    req.body.rol = "Admin"
    const newUser = new User(req.body);
    newUser.password = await newUser.encryptPassword(req.body.email);

    try {
        const result = await newUser.save();
        req.flash('success_msg', 'user Added Successfully');
        res.redirect('/users');
    } catch (err) {
        console.log(err.message);

        res.render('users/new-user', {
            newuser
        });
        req.flash('error', err.message);
    }
});

// Edit users
router.get('/users/edit/:id', isAuthenticated, async(req, res) => {
    const user = await User.findById(req.params.id);
    res.render('users/edit-user', { user, brands });
});

router.put('/users/edit/:id', isAuthenticated, async(req, res) => {
    if (req.file != null) {
        req.body.logo = '/uploads/' + req.file.filename;
    }
    await User.findByIdAndUpdate(req.params.id, req.body);
    req.flash('success_msg', 'user Updated Successfully');
    res.redirect('/users');
});

// Get user
router.get('/users/profile', isAuthenticated, async(req, res) => {
    console.log(req.user);
    const user = await User.findById(req.user._id);
    res.render('users/show', { user });
});

router.get('/user/facebook/login', passport.authenticate('facebook', {
    successRedirect: '/',
    failureRedirect: '/',
    failureFlash: true,
}));

router.get('/admin/user/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out now.');
    res.redirect('/');
});

router.get('/user/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out now.');
    res.redirect('/');
});

router.get('/users/delete', async(req, res) => {
    let user = await User.findById('5e98eaeb1377a04ef5134a36');
    await user.remove();
    console.log('removido')
});


module.exports = router;