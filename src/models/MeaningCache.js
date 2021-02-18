const { Model, Timestamps, persistence } = require('nedb-models');
const path = require('path');

class MeaningCache extends Model {
    static datastore() {
        return {
            filename: path.join(__dirname, '../database/MeaningCache.db')
        }
    }
}

MeaningCache.use([Timestamps, persistence]);
MeaningCache.compactDatafile;

module.exports = MeaningCache;