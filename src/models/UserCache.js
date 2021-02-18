const { Model, Timestamps } = require('nedb-models');
const path = require('path');

class UserCache extends Model {
    static datastore() {
        return {
            filename: path.join(__dirname, '../database/UserCache.db')
        }
    }
}

UserCache.use([Timestamps]);

module.exports = UserCache;