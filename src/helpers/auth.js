const userConnection = require('../models/Connection');
const moment = require('moment');
const helpers = {};
const mcache = require('memory-cache')

helpers.isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash('error_msg', 'Por favor hace login con tu facebook');
    res.redirect('/');
};

helpers.isTimeToPlay = async(req, res, next) => {
    /*     let c = global.Crons;
        let but = c[c.findIndex(function(e) { return e.name == 'playButton' })]
        let s = but.on.split(':');
        let e = but.off.split(':');
        let now = new moment();
        let start = new moment().set({ hour: s[0], minute: s[1] });
        let end = new moment().set({ hour: e[0], minute: e[1] }); */
    if (global.playButton) {
        return next();
    } else {
        req.flash('error_msg', 'Espera que activemos el próximo sorteo, y por favor no hagas trampa');
        res.redirect('/')
    }
};

helpers.isAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.rol == "Admin") {
        return next();
    }
    req.flash('error_msg', 'No eres Administrador, Por Favor Sal de Aqui!');
    res.redirect('/');
};

helpers.onAuthenticated = async(req, res, next) => {
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    await userConnection.countDocuments({ ip: ip }, async function(err, count) {
        if (count < 3) {
            const newConnection = new userConnection({ 'ip': ip, 'user': req.user._id });
            await newConnection.save();
            return next();
        }
        res.redirect('/ganadores');
    });
};

helpers.cache = (duration) => {
    return (req, res, next) => {
        let key = '__express__' + req.originalUrl || req.url
        let cachedBody = mcache.get(key)
        if (cachedBody) {
            res.send(cachedBody)
            return
        } else {
            res.sendResponse = res.send
            res.send = (body) => {
                mcache.put(key, body, duration * 1000);
                res.sendResponse(body)
            }
            next()
        }
    }
}

module.exports = helpers;