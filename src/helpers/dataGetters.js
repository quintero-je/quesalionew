const Matutina = require('../models/Matutina');
const Primera = require('../models/Primera');
const Vespertina = require('../models/Vespertina');
const Nocturna = require('../models/Nocturna');
const Jugada = require('../models/Jugada');
const User = require('../models/User');
const { sorteoTypes } = require('../config/config');
const moment = require('moment');
const DataCache = require('../models/DataCache');
const getAllQuiniella = {};
const MeaningCache = require('../models/MeaningCache');
const FileMan = require('./fileMan');
const path = require('path');
const Crons = require('../models/CronJobs');
const CronTime = require('cron').CronTime;
const masJugados = require('../models/MasJugados');
const Ganador = require('../models/Ganador');


getAllQuiniella.updatePrincipalCache = async function() {
    let today = moment().locale('es-do').format("YYYY[-]MM[-]DD");
    var newData = await getAllQuiniella.getFromServer("25,24,23,38,28,39", today);
    let file = new FileMan(path.join(__dirname, '../database/QuinielaPrincipal.db'));
    file.delFile();
    let n = new DataCache(newData);
    await n.save();
    //console.log('Data principal actualizada', String(new moment()));
}

getAllQuiniella.updateMasJugados = async function() {
    let mp = await getAllQuiniella.masJugado();
    let file = new FileMan(path.join(__dirname, '../database/MasJugados.db'));
    file.delFile();
    let mpc = new masJugados(mp);
    await mpc.save();
}

getAllQuiniella.getNocturnaValue = async function() {
    let date = new moment();
    //date = date.subtract(2, 'days');
    //let nocturna = await Nocturna.getNocturna('25,00', "2020-10-10").lean();
    let nocturna = await Nocturna.getNocturna('25,00', date.format("YYYY[-]MM[-]DD")).lean();
    if (nocturna[0].value != '----') {
        return true
    } else {
        return false
    }
}

getAllQuiniella.letsPlay = async function() {

    let date = new moment();
    //date = date.subtract(2, 'days');
    //let nocturna = await Nocturna.getNocturna('25,00', "2020-10-10").lean();
    let nocturna = await Nocturna.getNocturna('25,00', date.format("YYYY[-]MM[-]DD")).lean();
    let jugs = await Jugada.find({ status: 'Activa', terminal: nocturna[0].meaning_number });
    let winners = [];
    let winnerPpal = [];

    if (jugs != null || jugs != undefined || jugs != [] && jugs.length > 0) {
        for (let i = 0; i < jugs.length; i++) {
            let number = String(nocturna[0].value)
            let bet = String(jugs[i].numero);
            let w = {
                id_usuario: jugs[i].id_usuario,
                id_jugada: jugs[i]._id,
                numero: jugs[i].numero,
                importe: jugs[i].importe,
                terminal: jugs[i].terminal,
                id_sorteo: nocturna[0]._id,
                fecha_jugada: jugs[i].date,
                fecha_sorteo: nocturna[0].updated_at,
                numeroSorteo: nocturna[0].value,
                meaning: nocturna[0].meaning,
            };
            if (number.slice(-4) === bet.slice(-4) || number === bet) {
                let c = await getAllQuiniella.setWinerCredit(jugs[i].id_usuario, jugs[i].importe, 3500)
                w.type = "4digitos";
                w.creditos = c;
                let winner = new Ganador(w);
                await winner.save()
                winners.push(winner);
            } else {
                if (number.slice(-3) === bet) {
                    let c = await getAllQuiniella.setWinerCredit(jugs[i].id_usuario, jugs[i].importe, 600)
                    w.creditos = c;
                    w.type = "3digitos";
                    let winner = new Ganador(w);
                    await winner.save()
                    winners.push(winner);
                } else {
                    if (number.slice(-2) === bet) {
                        let c = await getAllQuiniella.setWinerCredit(jugs[i].id_usuario, jugs[i].importe, 70)
                        w.creditos = c;
                        w.type = "2digitos";
                        let winner = new Ganador(w);
                        await winner.save()
                        winners.push(winner);
                    }
                }
            }
        }
        if (winners.length > 0) {
            getAllQuiniella.setWinnerSaldo(winners)
        }

    }
}

getAllQuiniella.setWinerCredit = async function(idUser, credit, type) {
    let u = await User.findById(idUser);
    let c = Number(u.credito) + (Number(credit) * type)
    await User.findByIdAndUpdate(idUser, { $set: { credito: c } });
    return c - u.credito;
}

getAllQuiniella.setWinnerSaldo = async function(winnersAll) {
    winnersAll.sort(function(a, b) { return b.creditos - a.creditos });
    let winners = [{ credito: 0 }];
    for (let i = 0; i < winnersAll.length; i++) {
        let e = winnersAll[i];
        if (e.creditos > winners[0].credito) {
            winners = [];
            winners.push(e);
        } else {
            if (e.creditos == winners[0].credito) {
                winners.push(e);
            }
        }
    }

    if (winners.length == 1 && winners[0].credito > 0) {
        let win = await User.findById(winners[0].id_usuario);
        let c = Number(win.saldo) + 1000;
        await User.findByIdAndUpdate(winners[0].id_usuario, { $set: { saldo: c } })
        await Ganador.findByIdAndUpdate(winners[0]._id, { $set: { saldo: 1000 } });
    } else {
        let premio = 1000 / winners.length;
        for (let i = 0; i < winners.length; i++) {
            const el = winners[i];
            let win = await User.findById(winners[i].id_usuario);
            let c = Number(win.saldo) + premio;
            await User.findByIdAndUpdate(winners[i].id_usuario, { $set: { saldo: c } })
            await Ganador.findByIdAndUpdate(winners[i]._id, { $set: { saldo: premio } });
        }
    }
}

getAllQuiniella.winnersList = async function() {
    let date = new moment();
    let nocturna = await Nocturna.getNocturna('25,00', date.format("YYYY[-]MM[-]DD")).lean();
    let ganadores = await Ganador.find({ "status": "Activa" }).lean();
    ganadores.sort(function(a, b) { return b.credito - a.credito });
    if (ganadores === null || ganadores === undefined || ganadores.length == 0) {
        return {
            numero: nocturna[0].value,
            winnersNro: 0
        };
    } else {

        let sortW = [];
        let winnerPpal = [{ credito: 0 }];
        let winners = [];

        for (let i = 0; i < ganadores.length; i++) {
            let e = ganadores[i];
            if (!sortW.includes(e.id_usuario)) {
                sortW.push(e.id_usuario);
            }
        }

        for (let i = 0; i < sortW.length; i++) {
            let e = sortW[i];
            let w = await Ganador.find({ "id_usuario": e }).lean();
            let u = await User.findById(e)
            let c = 0;
            let winn = false;

            for (let i = 0; i < w.length; i++) {
                let f = w[i];
                c = c + Number(f.creditos);
                if (f.saldo != null || f.saldo != undefined || f.saldo > 0) {
                    winn = true
                }
            }

            let body = {
                nro: i + 1,
                user_id: u._id,
                userName: u.name,
                pictureUrl: u.pictureUrl,
                status: u.status,
                credito: c,
                winner: winn,
                plays: w
            }
            winners.push(body);

        }

        winners.sort(function(a, b) { return b.credito - a.credito });

        for (let i = 0; i < winners.length; i++) {
            let e = winners[i];
            if (e.credito > winnerPpal[0].credito) {
                winnerPpal = [];
                winnerPpal.push(e);
            } else {
                if (e.creditos == winnerPpal[0].credito) {
                    winnerPpal.push(e);
                }
            }
        }


        return {
            winners: winners,
            numero: nocturna[0].value,
            winnerPpal: winnerPpal,
            winnersNro: winners.length,
        };
    }

}

getAllQuiniella.getFromServer = async(cities, day) => {

    let nextSorteo = await getAllQuiniella.nextPlay()
    let date = new moment(day).format("YYYY[-]MM[-]DD");

    let lastQuiniela = '';

    let primera = await Primera.getPrimera(cities, date).lean();
    let matutina = await Matutina.getMatutina(cities, date).lean();
    let vespertina = await Vespertina.getVespertina(cities, date).lean();
    let nocturna = await Nocturna.getNocturna(cities, date).lean();
    let players = await User.countDocuments({ jugada: 'Activa' });
    let ganadores = await Ganador.find({ status: 'Activa' });
    let sortW = [];
    for (let i = 0; i < ganadores.length; i++) {
        let e = ganadores[i];
        if (!sortW.includes(e.id_usuario)) {
            sortW.push(e.id_usuario);
        }
    }

    function agregar(model, qType) {
        let nmod = [];
        for (let i = 0; i < model.length; i++) {
            const e = model[i];
            e.qType = qType;
            nmod.push(e)
        }
        return nmod;
    }

    primeraPpal = await primera.map((prim, index, array) => {
        return { "id_loteria": prim.id_loteria, "city": prim.city, "primera": prim.value };
    });

    matutinaPpal = await matutina.map((matu, index, array) => {
        return { "city": matu.city, "matutina": matu.value };
    });

    vespertinaPpal = await vespertina.map((vesp, index, array) => {
        return { "city": vesp.city, "vespertina": vesp.value };
    });

    nocturnaPpal = await nocturna.map((noct, index, array) => {
        return { "city": noct.city, "nocturna": noct.value };
    });

    var cities = [];
    var citiesa = [];
    var dataPpal = [];

    primeraPpal.forEach(e => {
        matutinaPpal.forEach(el => {
            if (e.city == el.city) {
                cities.push({ "id_loteria": e.id_loteria, 'city': el.city, 'primera': e.primera, 'matutina': el.matutina });
            }
        });
    });
    vespertinaPpal.forEach(e => {
        nocturnaPpal.forEach(el => {
            if (e.city == el.city) {
                citiesa.push({ 'city': e.city, 'vespertina': e.vespertina, 'nocturna': el.nocturna });
            }
        });
    });
    cities.forEach(e => {
        citiesa.forEach(el => {
            if (e.city == el.city) {
                dataPpal.push({ "id_loteria": e.id_loteria, 'city': e.city, 'primera': e.primera, 'matutina': e.matutina, 'vespertina': el.vespertina, 'nocturna': el.nocturna });
            }
        });
    });

    let primeraH = agregar(primera, 'LA PRIMERA ' + sorteoTypes.primera_hour);
    let matutinaH = agregar(matutina, 'MATUTINA ' + sorteoTypes.matutina_hour);
    let vespertinaH = agregar(vespertina, 'VESPERTINA ' + sorteoTypes.vespertina_hour);
    let nocturnaH = agregar(nocturna, 'NOCTURNA ' + sorteoTypes.nocturna_hour);
    lastQuiniela = [primeraH, matutinaH, vespertinaH, nocturnaH];

    let yest = new moment().subtract(1, 'days').format("YYYY[-]MM[-]DD");


    return { 'principal': dataPpal, 'lastQuinielaData': lastQuiniela, 'nextSorteo': nextSorteo, 'players': players, ganadores: sortW.length };
};

getAllQuiniella.nextPlay = async function() {
    let now = new Date().getTime();
    let next = await Crons.findOne({ name: 'Sorteo' });
    let nextTime = new CronTime(next.cron).getTimeout()
    nextTime = Number(nextTime) + Number(now);
    return nextTime;
}

getAllQuiniella.masJugado = async function() {
    let numfreq = [];
    let jugadas = await Jugada.find({ status: 'Activa' }, { id_usuario: 1, numero: 1, importe: 1, terminal: 1, date: 1 }).lean();
    jugadas.forEach(async(e) => {
        let t = e.terminal;
        let n = e.numero;
        let imp = e.importe;
        let us = e.id_usuario;
        let dat = e.date

        if (numfreq.find(el => el.number == t)) {
            let x = numfreq.findIndex(el => el.number == t);
            numfreq[x].freq++;

            if (numfreq[x].users.find(ele => ele.id_player == us)) {
                numfreq[x].users[numfreq[x].users.findIndex(ele => ele.id_player == us)].plays.push({
                    numero: n,
                    importe: imp,
                    date: dat
                });
            } else {
                numfreq[x].users.push({ id_player: us, playerPic: "", playerName: "", plays: [{ numero: n, importe: imp, date: dat }] })
            }
        } else {
            numfreq.push({ number: t, meaning: "", freq: 1, users: [{ id_player: us, playerPic: "", playerName: "", plays: [{ numero: n, importe: imp, date: dat }] }] })
        }
    });


    numfreq.sort(function(a, b) {
        return b.freq - a.freq;
    });

    //let mostPlayed = [numfreq[0], numfreq[1], numfreq[2]]
    let mostPlayed = numfreq;
    let players = await User.find({ jugada: 'Activa' }, { name: 1, pictureUrl: 1 });
    let meanings = await MeaningCache.find();

    for (let i = 0; i < mostPlayed.length; i++) {

        for (let y = 0; y < meanings.length; y++) {
            if (mostPlayed[i].number == meanings[y].number) {
                mostPlayed[i].meaning = meanings[y].meaning
            }
        };

        for (let x = 0; x < mostPlayed[i].users.length; x++) {
            let p = mostPlayed[i].users[x];
            players.forEach(e => {
                if (p.id_player == e.id) {
                    mostPlayed[i].users[x].playerPic = e.pictureUrl;
                    mostPlayed[i].users[x].playerName = e.name
                }
            })
        }

    }

    mostPlayed.players = await User.countDocuments({ jugada: 'Activa' });


    return mostPlayed;
}

getAllQuiniella.setAllCredits = async() => {
    await User.updateMany({ jugada: 'Activa' }, { $set: { jugada: '' } });
    let re = await User.updateMany({ $and: [{ status: 'Free' }, { credito: { $lt: 50 } }] }, { $set: { credito: 50 } });
    let ra = await User.updateMany({ status: 'Premium Diamond', credito: { $lt: 2750 } }, { $set: { credito: 2750 } });
    await User.updateMany({ status: 'Premium Platinum', credito: { $lte: 1250 } }, { $set: { credito: 1250 } });
    await User.updateMany({ status: 'Premium Gold', credito: { $lte: 550 } }, { $set: { credito: 550 } });
    await User.updateMany({ status: 'Premium Silver', credito: { $lte: 175 } }, { $set: { credito: 175 } })
}

getAllQuiniella.setBetsExpired = async function() {
    await Jugada.updateMany({ status: 'Activa' }, { $set: { status: 'Caduca' } });
}

getAllQuiniella.setWinnersExpired = async function() {
    await Ganador.updateMany({ status: 'Activa' }, { $set: { status: 'Caduca' } });
}

module.exports = getAllQuiniella;