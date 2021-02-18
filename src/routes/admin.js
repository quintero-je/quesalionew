const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');
const Crons = require('../models/CronJobs')
const { isAuthenticated, isAdmin } = require('../helpers/auth');


router.get('/admin/user/signin', (req, res) => {
    res.render('users/signin', { layout: false })
});

router.post('/admin/user/signin', passport.authenticate('local', {
    successRedirect: '/admin/user/dash',
    failureRedirect: '/admin/user/signin',
    failureFlash: true,
}));

router.get('/admin/user/dash', isAdmin, async(req, res) => {
    let crons = await Crons.find();
    res.render('users/dashboard', {
        layout: 'admin',
        crons: crons
    });
});

router.post('/admin/cron/update', isAdmin, async(req, res) => {

    if (req.body.cron) {
        await Crons.update({ "name": req.body.name }, { $set: { cron: req.body.cron } });
    } else {
        await Crons.update({ "name": req.body.name }, { $set: { on: req.body.on, off: req.body.off } });
    }
    res.json({ data: "ok" });
})

router.get('/admin/cronjobs', isAdmin, async(req, res) => {
    let crons = await Crons.find();
    res.render('users/cronjobs', {
        layout: 'admin',
        crons: crons,
    });
});

module.exports = router;