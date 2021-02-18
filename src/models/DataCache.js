const { Model, Timestamps, persistence } = require('nedb-models');
const path = require('path');

class QuinielaPrincipal extends Model {
    static datastore() {
        return {
            filename: path.join(__dirname, '../database/QuinielaPrincipal.db')
        }
    }
}

QuinielaPrincipal.use([Timestamps, persistence]);
QuinielaPrincipal.compactDatafile;

module.exports = QuinielaPrincipal;