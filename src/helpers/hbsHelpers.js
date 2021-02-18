const Handlebars = require('handlebars');
const Cron = require('../models/CronJobs');
const moment = require('moment');

Handlebars.registerHelper('ifCond', function(v1, operator, v2, options) {
    switch (operator) {
        case '==':
            return (v1 == v2) ? options.fn(this) : options.inverse(this);
        case '===':
            return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case '<':
            return (v1 < v2) ? options.fn(this) : options.inverse(this);
        case '<=':
            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
        case '>':
            return (v1 > v2) ? options.fn(this) : options.inverse(this);
        case '>=':
            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
        case '&&':
            return (v1 && v2) ? options.fn(this) : options.inverse(this);
        case '||':
            return (v1 || v2) ? options.fn(this) : options.inverse(this);
        default:
            return options.inverse(this);
    }
});

Handlebars.registerHelper('button', function(button, options) {
    /*     let c = global.Crons;
        let but = c[c.findIndex(function(e) { return e.name == button })]
        let s = but.on.split(':');
        let e = but.off.split(':');
        let now = new moment();
        let on = new moment().set({ hour: s[0], minute: s[1] });
        let off = new moment().set({ hour: e[0], minute: e[1] });
        let res = now.isBetween(on, off); */
    return (global[button]) ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('RandNumber', function() {

    return Math.floor(Math.random() * 10) + 1;
});

Handlebars.registerHelper('ArrCount', function(arr) {

    if (Array.isArray(arr)) {
        return arr.length
    } else {
        return "Esto no es un arreglo"
    }

});

Handlebars.registerHelper('TotalBet', function(array) {
    let total = 0;
    for (let i = 0; i < array.length; i++) {
        total = total + array[i].importe;
    }
    return total;
});


module.exports = Handlebars;