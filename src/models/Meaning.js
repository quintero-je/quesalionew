const Mongoose = require('mongoose');

const Schema = Mongoose.Schema;

class MeaningType {
    static getMeaningTypes() {
        return this.find().sort({position: 1});
    }

    static getMeaningType(id) {
        return this.find({
            _id: {
                $eq: id
            }
        });
    }
}

const MeaningTypeSchema = new Schema(
    {
        name: String,
        isName: Number,
        position: Number,
        details: [
            {
                image: String,
                number: String,
                meaning: String
            }
        ]
    },
    {
        collection: 'meaning_type'
    }
);

MeaningTypeSchema.loadClass(MeaningType);

module.exports = Mongoose.model('MeaningType', MeaningTypeSchema);
