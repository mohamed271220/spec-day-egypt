const mongoose = require('mongoose');
const City = require('./models/City'); // Adjust the path as necessary
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

// Path to your city.list.json file
const jsonFilePath = path.join(__dirname, 'city.list.json');

// Read and parse JSON data
const cities = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));

// Filter out cities with missing or empty 'country' field
const citiesToInsert = cities.filter(city => city.country && city.country.trim() !== '')
    .map(city => ({
        id: city.id,
        name: city.name,
        country: city.country,
        coord: {
            lon: city.coord.lon,
            lat: city.coord.lat
        }
    }));

mongoose.connect(process.env.MONGO_DB, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('MongoDB connected');
        return City.insertMany(citiesToInsert); // Insert filtered cities
    })
    .then(() => {
        console.log('Cities inserted successfully');
        mongoose.connection.close();
    })
    .catch(err => {
        console.error('Error inserting cities:', err);
        mongoose.connection.close();
    });
