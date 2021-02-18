const mongoose = require('mongoose');

//var db = process.env.MONGOURI || 'mongodb://localhost/horacloud-db';

var db = 'mongodb://quesalio:quesalio777@51.68.133.225/quesalio'

mongoose.set('useFindAndModify', false);
mongoose.set('useUnifiedTopology', true);
mongoose.set('useNewUrlParser', true);
mongoose.connect(db, {
        useCreateIndex: true,
        useNewUrlParser: true
    })
    .then(db => console.log('DB is connected'))
    .catch(err => console.error(err));