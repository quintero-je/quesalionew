let sorteoTypes = {
    'primera_hour': "11:30",
    'matutina_hour': "14:00",
    'vespertina_hour': "17:30",
    'nocturna_hour': "21:00"
};
var passportIds = {

    clientID: '255378138964948',
    clientSecret: 'c6f954007adc43ccf6bffd7b96434c81',
    callbackURL: "https://quesalionew.herokuapp.com/auth/facebook/callback"

}

var cronJobsHours = {

}

module.exports = { sorteoTypes, passportIds, cronJobsHours };