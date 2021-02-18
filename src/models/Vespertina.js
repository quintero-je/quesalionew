const Mongoose = require('mongoose');

const Schema = Mongoose.Schema;

class Vespertina {
    static getVespertina(ids, date) {
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

    static getVespertinaModified(ids) {
        let ids_to_search = ids.split(',');
        return this.find({
            _id: {
                $in: ids_to_search
            }
        });
    }
}

const VespertinaSchema = new Schema(
    {
        city: String,
        value: String,
        id_loteria: String,
        id_draw: String,
        date: Date,
        numbers: [
            {
                number: Number,
                value: String
            }
        ],
        meaning: String,
        meaning_number: String,
        meaning_image: String
    },
    {
        collection: 'vespertina'
    }
);

VespertinaSchema.loadClass(Vespertina);
module.exports = Mongoose.model('Vespertina', VespertinaSchema);
