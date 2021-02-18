const Mongoose = require('mongoose');

const Schema = Mongoose.Schema;

class Primera {
    static getPrimera(ids, date) {
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

    static getPrimeraModified(ids) {
        let ids_to_search = ids.split(',');
        return this.find({
            _id: {
                $in: ids_to_search
            }
        });
    }
}

const PrimeraSchema = new Schema(
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
        collection: 'primera'
    }
);

PrimeraSchema.loadClass(Primera);

module.exports = Mongoose.model('Primera', PrimeraSchema);
