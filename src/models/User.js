const mongoose = require('mongoose');
const { Schema } = mongoose;

const bcrypt = require('bcryptjs');

const UserSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true },
    password: { type: String, required: true },
    date: { type: Date, default: Date.now },
    userID: { type: String },
    pictureUrl: { type: String },
    phone: { type: String },
    rol: { type: String, default: "player" },
    status: { type: String, default: 'Free' },
    remember_token: { type: String },
    credito: { type: Number },
    saldo: { type: Number },
    jugada: { type: String }
});

UserSchema.methods.encryptPassword = async(password) => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return hash;
};

UserSchema.methods.matchPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

class User {
    static getUserNamePic(id) {
        return this.findOne({ _id: id }, { name: 1, pictureUrl: 1 });
    }

    static setUsersCreditByStatus(status, credito) {
        let users = this.find({ status: status }).lean();
        users.forEach(element => {
            this.findByIdAndUpdate(element._id, { credito: credito })
        });
    }

    static setUserCreditById(id, credito) {
        return this.findByIdAndUpdate(id, { credito: credito }) ? true : false;
    }

    static setUserSaldoById(id, saldo) {
        return this.findByIdAndUpdate(id, { saldo: saldo }) ? true : false;
    }

}

UserSchema.loadClass(User);

module.exports = mongoose.model('User', UserSchema);