const { Model, Timestamps, persistence } = require('nedb-models');
const path = require('path');

class CronJobs extends Model {
    static datastore() {
        return {
            filename: path.join(__dirname, '../database/CronJobs.db')
        }
    }
}

CronJobs.use([Timestamps, persistence]);
CronJobs.compactDatafile;

module.exports = CronJobs;