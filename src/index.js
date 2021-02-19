const express = require('express');
const Handlebars = require('handlebars');
const exphbs = require('express-handlebars');
const path = require('path');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const bodyParser = require('body-parser');
const compression = require('compression');
const https = require('https');
const fs = require('fs');
const { nextPlay } = require('./helpers/dataGetters');
const { passportIds } = require('./config/config');
const CronJobs = require('./models/CronJobs');

// Initializations
//const key = fs.readFileSync('./key.pem');
//const cert = fs.readFileSync('./cert.pem');

//const key = fs.readFileSync('/home/taek/quesalionew/src/key.pem');
//const cert = fs.readFileSync('/home/taek/quesalionew/src/cert.pem');

const app = express();
require('./database');
require('./config/passport');
require('./config/passport-facebook');
require('./helpers/hbsHelpers');
///require('./helpers/mailer');



// settings
app.set('port', process.env.PORT || 4001);
app.set('views', path.join(__dirname, 'views'));
app.set('trust proxy', 'loopback');
var oneYear = 31557600000;
app.use(compression());
app.use(express.static(__dirname + '/public', { maxAge: oneYear }));
app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs',
    allowProtoMethodsByDefault: true
}));

//app.enable('view cache');
app.set('view engine', '.hbs');

// middlewares
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: '10mb' }))
app.use(flash());

// Global Variables
app.use(async(req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.nextSorteo = await nextPlay();
    next();
});

global.playButton = true;
global.liveButton = true;
global.winnersButton = false;

(async function() {
    let b = await CronJobs.find();
    global.Crons = b;
}())


// routes
app.use(require('./routes'));
app.use(require('./routes/users'));
app.use(require('./routes/admin'));

// static files
app.use(express.static(path.join(__dirname, 'public')));

// Cron Jobs
require('./helpers/cronJobs');

// Server is listening

/*const server = https.createServer({ key: key, cert: cert }, app);
server.listen(app.get('port'), () => {
    console.log('Server on port', app.get('port'));
});*/

app.listen(app.get('port'), () => {
    console.log('Server on port', app.get('port'));
});