const mongoose = require('mongoose');
const { Schema } = mongoose;

class Matutina {
    static getMatutina(ids, date) {
        let ids_to_search = ids.split(',');
        return this.find({
            date: {
                $eq: new Date(date)
            },
            id_loteria: {
                $in: ids_to_search
            }
        });
    }

    static getMatutinaModified(ids) {
        let ids_to_search = ids.split(',');
        return this.find({
            _id: {
                $in: ids_to_search
            }
        });
    }
}

const MatutinaSchema = new Schema({
    city: String,
    value: String,
    id_loteria: String,
    id_draw: String,
    date: Date,
    numbers: [{
        number: Number,
        value: String
    }],
    meaning: String,
    meaning_number: String,
    meaning_image: String
}, {
    collection: 'matutina'
});

MatutinaSchema.loadClass(Matutina);
module.exports = mongoose.model('Matutina', MatutinaSchema);