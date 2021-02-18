const Mongoose = require('mongoose');

const Schema = Mongoose.Schema;
const GanadorSchema = new Schema({
    numero: Number,
    importe: Number,
    id_usuario: String,
    id_jugada: String,
    terminal: Number,
    date: { type: Date, default: new Date() },
    id_sorteo: String,
    meaning: String,
    terminal: Number,
    fecha_jugada: Date,
    fecha_sorteo: Date,
    numeroSorteo: Number,
    creditos: Number,
    saldo: Number,
    status: { type: String, default: "Activa" }
}, {
    collection: 'Ganador'
});

module.exports = Mongoose.model('Ganador', GanadorSchema);