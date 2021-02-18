const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

class Jugada {
    static getFreqBets(terms) {
        return this.find({
            terminal: {
                $in: terms
            }
        });
    };
}

const JugadaSchema = new Schema({
    numero: String,
    importe: Number,
    terminal: String,
    id_usuario: String,
    date: { type: Date, default: new Date() },
    id_sorteo: String,
    id_ciudad: String,
    value: String,
    status: String,
    details: String
}, {
    collection: 'jugada'
});

JugadaSchema.loadClass(Jugada);



module.exports = Mongoose.model('Jugada', JugadaSchema);