const { Model, Timestamps } = require('nedb-models');
const path = require('path');

class JugadaCache extends Model {
    static datastore() {
        return {
            filename: path.join(__dirname, '../database/JugadaCache.db')
        }
    }
}

JugadaCache.use([Timestamps]);

module.exports = JugadaCache;