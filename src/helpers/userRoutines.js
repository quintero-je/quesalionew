const userRoutines = {};
const User = require('../models/User');

userRoutines.setUserCreditById = async(id, credito) => {
    await User.findByIdAndUpdate(id, { credito: credito })
};

userRoutines.setUsersCreditByStatus = async(status, credito) => {
    let users = await User.find({ status: status }).lean();
    users.forEach(async element => {
        await User.findByIdAndUpdate(element._id, { credito: credito })
    });
};

userRoutines.setUserSaldoById = async(id, saldo) => {
    await User.findByIdAndUpdate(id, { saldo: saldo })
}




module.exports = userRoutines