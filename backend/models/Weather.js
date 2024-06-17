const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WeatherSchema = new Schema({
    city: {
        type: Schema.Types.ObjectId,
        ref: 'City',
        required: true,
    },
    current: {
        temp: Number,
        humidity: Number,
        windSpeed: Number,
        description: String,
        icon: String,
        timestamp: {
            type: Date,
            default: Date.now,
        },
    },
    hourly: [
        {
            temp: Number,
            humidity: Number,
            windSpeed: Number,
            description: String,
            icon: String,
            timestamp: Date,
        },
    ],
    daily: [
        {
            minTemp: Number,
            maxTemp: Number,
            humidity: Number,
            windSpeed: Number,
            description: String,
            icon: String,
            timestamp: Date,
        },
    ],
}, { timestamps: true });

module.exports = mongoose.model('Weather', WeatherSchema);
