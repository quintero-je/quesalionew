const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserConnectionSchema = new Schema({
    ip: {
        type: String,
    },
    token: {
        type: String,
    },
    status: {
        type: Boolean,
    },
    date: {
        type: Date,
        default: Date.now
    },
    user: {
        type: String,
    }
});

module.exports = mongoose.model('UserConnections', UserConnectionSchema);