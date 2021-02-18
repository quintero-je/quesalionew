const CronJob = require('cron').CronJob;
const cronConfig = require('../models/CronJobs');
const { getNocturnaValue, updatePrincipalCache, updateMasJugados, letsPlay, setAllCredits, setWinnersExpired, setBetsExpired } = require('../helpers/dataGetters');


//Sorteo Nocturna Ciudad
(async function() {
    let cron = await cronConfig.findOne({ name: 'Sorteo' });
    let Sorteo = new CronJob(String(cron.cron), async function() {
        await setWinnersExpired();
        await letsPlay();
        await setBetsExpired();
    }, null, true);
    Sorteo.start();
}());

//playButton 
(async function() {
    let cronOn = await cronConfig.findOne({ name: 'playButtonOn' });
    let PlayButtonOn = new CronJob(String(cronOn.cron), async function() {
        global.playButton = true;
    }, null, true);
    let cronOff = await cronConfig.findOne({ name: 'playButtonOff' });
    let PlayButtonOff = new CronJob(String(cronOff.cron), async function() {
        global.playButton = false;
    }, null, true);
    PlayButtonOn.start();
    PlayButtonOff.start();
}());

//liveButton 
(async function() {
    let cronOn = await cronConfig.findOne({ name: 'liveButtonOn' });
    let LiveButtonOn = new CronJob(String(cronOn.cron), async function() {
        global.liveButton = true;
    }, null, true);
    let cronOff = await cronConfig.findOne({ name: 'liveButtonOff' });
    let LiveButtonOff = new CronJob(String(cronOff.cron), async function() {
        global.liveButton = false;
    }, null, true);
    LiveButtonOn.start();
    LiveButtonOff.start();
}());


//winnersButton 
(async function() {
    let cronOn = await cronConfig.findOne({ name: 'winnersButtonOn' });
    let WinnersButtonOn = new CronJob(String(cronOn.cron), async function() {

        if (getNocturnaValue() != '----') {
            global.winnersButton = true;
        } else {
            global.winnersButton = false;
        }
    }, null, true);
    let cronOff = await cronConfig.findOne({ name: 'winnersButtonOff' });
    let WinnersButtonOff = new CronJob(String(cronOff.cron), async function() {
        global.winnersButton = false;
    }, null, true);
    WinnersButtonOn.start();
    WinnersButtonOff.start();
}());


//reset los creditos
(async function() {
    let cron = await cronConfig.findOne({ name: 'Reset Creditos' });
    let Creditos = new CronJob(String(cron.cron), async function() {
        await setAllCredits();
    }, null, true);
    Creditos.start();
}());

module.exports = CronJob;