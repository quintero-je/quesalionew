const express = require('express');
const router = express.Router();
const Moment = require('moment');
const { dataIndex, dataJugadas, test, updatePrincipalCache, winnersList, freqToZero, getFromServer, masJugado, updateMasJugados, setBetsExpired, setAllCredits } = require('../helpers/dataGetters');
const { isAuthenticated, isTimeToPlay, cache } = require('../helpers/auth');
const DataCache = require('../models/DataCache');
const Jugada = require('../models/Jugada');
const User = require('../models/User');
const Meaning = require('../models/MeaningCache');
const { setUserCreditById } = require('../helpers/userRoutines');
const masJugados = require('../models/MasJugados');
const Ganador = require('../models/Ganador');
const nodemailer = require("nodemailer");
const hbs = require('handlebars')



router.get('/', cache(30), async(req, res) => {

    let now = new Moment();
    let day = new Moment(now).set({ 'hour': 11, 'minute': 30 });
    let date = new Moment(day).set({ 'hour': 11, 'minute': 30 });

    if (now.isAfter(day)) {
        if (now.day() == 0) {
            date = date.subtract(1, 'days').format("YYYY[-]MM[-]DD");
        } else {
            date = date.format("YYYY[-]MM[-]DD");
        }
    } else {
        if (now.day() == 1) {
            date = date.subtract(2, 'days').format("YYYY[-]MM[-]DD");
        } else {
            if (now.day() == 0) {
                date = date.subtract(1, 'days').format("YYYY[-]MM[-]DD");
            } else {
                date = date.subtract(1, 'days').format("YYYY[-]MM[-]DD");
            }
        }
    }
    data = await getFromServer("25,24,23,38,28,39", date);

    res.render('index', {
        layout: "main",
        sorteo: data.lastQuinielaData,
        principal: data.principal,
        players: data.players,
        city: 'Buenos Aires',
        day: date,
        ganadores: data.ganadores,
        user: req.user || null,
        userName: req.user ? req.user.name : false,
        userPicture: req.user ? req.user.pictureUrl : false,
        userId: req.user ? req.user.userID : false,
        userCredito: req.user ? req.user.credito : 00,
        userSaldo: req.user ? req.user.saldo : 00,
        userRol: req.user ? req.user.rol : false,
    });
});

router.post('/', isAuthenticated, async(req, res) => {
    let data = await getFromServer(req.body.where, req.body.when);
    res.render('index', {
        layout: "main",
        sorteo: data.lastQuinielaData,
        principal: data.principal,
        players: data.players ? data.players : 0,
        city: req.body.city ? req.body.city : 'Buenos Aires',
        day: req.body.when ? req.body.when : 0,
        user: req.user || null,
        userName: req.user ? req.user.name : false,
        userPicture: req.user ? req.user.pictureUrl : false,
        userId: req.user ? req.user.userID : false,
        userCredito: req.user ? req.user.credito : 00,
        userSaldo: req.user ? req.user.saldo : 00,
        userRol: req.user ? req.user.rol : false,
        ganadores: data.ganadores
    });
});

router.post('/send/payment/account', isAuthenticated, async(req, res) => {
    let plays = Ganador.find({ id_usuario: req.user._id, status: 'Activa' });


    email({
        mpEmail: req.body.email,
        userName: req.user.name,
        userSaldo: req.user.saldo,
        userPicture: req.user.pictureUrl,
        userCredito: req.user.credito,
        plays: plays,
        user: req.user || null,
        userName: req.user ? req.user.name : false,
        userPicture: req.user ? req.user.pictureUrl : false,
        userId: req.user ? req.user.userID : false,
        userCredito: req.user ? req.user.credito : 00,
        userSaldo: req.user ? req.user.saldo : 00,
        userRol: req.user ? req.user.rol : false
    }).catch(console.error);
    res.redirect('/');
})

router.post('/user/newBet', isAuthenticated, isTimeToPlay, async(req, res) => {
    let data = req.body.jugada;
    let credito = req.user.credito;
    if (Array.isArray(data)) {
        for (let index = 0; index < data.length; index++) {
            let bet = data[index].toString();
            bet = bet.split(',');
            if (Number(credito) >= Number(bet[1])) {
                credito = Number(credito) - Number(bet[1]);
                let term = bet[0].slice(-2);
                let jugada = new Jugada({
                    numero: bet[0],
                    importe: bet[1],
                    terminal: term,
                    id_usuario: req.user.id,
                    status: 'Activa',
                    date: new Date()
                });
                await jugada.save();
                await User.findByIdAndUpdate(req.user.id, { credito: credito });
                await updatePrincipalCache()
            } else {
                req.flash('error_msg', 'Su última jugada no fue registrada por falta de créditos.');
                res.redirect('/');
            }
        };
    } else {
        bet = data.split(',')
        if (Number(credito) >= Number(bet[1])) {
            credito = Number(credito) - Number(bet[1]);
            let term = bet[0].slice(-2);
            let jugada = new Jugada({
                numero: bet[0],
                importe: bet[1],
                terminal: term,
                id_usuario: req.user.id,
                status: 'Activa',
                date: new Date()
            });
            await jugada.save();
            await User.findByIdAndUpdate(req.user.id, { credito: credito });
        } else {
            req.flash('error_msg', 'Su última jugada no fue registrada por falta de créditos.');
            res.redirect('/');
        }
    }
    await User.findByIdAndUpdate(req.user.id, { jugada: 'Activa' })
    await updateMasJugados();
    await updatePrincipalCache();
    req.flash('success_msg', 'Jugada registrada, Suerte!!');
    res.redirect('/');
});

router.get('/ganadores', cache(15), async(req, res) => {
    let winners = await winnersList();
    res.render('ganadores', { winners });
});

router.get('/jugadas', cache(15), async(req, res) => {
    let numbers = await masJugado();
    if (!numbers) {
        numbers = masJugado();
    }
    res.render('jugadas', { numbers: numbers });
});

async function email(data) {
    let plays = '';
    if (data.plays) {
        for (let i = 0; i < data.plays.length; i++) {
            const e = array[i];
            plays += '<tr>' +
                '<td>' + e.terminal + '</td>' +
                '<td>' + e.numero + '</td>' +
                '<td>' + e.importe + '</td>' +
                '<td>' + e.importe + '</td>' +
                '<td>' + e.importe ? e.importe : 0 + '</td>' +
                '</tr>';
        }
    }
    let html = hbs.compile('mail_1ganador', data)
        // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: 'ganadorquesalio@gmail.com', // generated ethereal user
            pass: 'quesalio7772020' // generated ethereal password
        },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: '"Ganador" <ganadorquesalio@gmail.com>', // sender address
        to: "quintero.je@gmail.com", // list of receivers
        subject: "Hello ✔", // Subject line
        text: "Hello world?",
        html: html,
    });
}


module.exports = router