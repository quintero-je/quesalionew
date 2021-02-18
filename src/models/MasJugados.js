const { Model, Timestamps, persistence } = require('nedb-models');
const path = require('path');

class MasJugados extends Model {
    static datastore() {
        return {
            filename: path.join(__dirname, '../database/MasJugados.db')
        }
    }
}

MasJugados.use([Timestamps, persistence]);
MasJugados.compactDatafile;

module.exports = MasJugados;