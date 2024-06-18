const cron = require('node-cron');
const mongoose = require('mongoose');
const fetchWeatherData = require('./services/weatherUpdate'); // Adjust path as needed
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGO_DB, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('MongoDB connected');
        startScheduler();
    })
    .catch(err => {
        console.error('Error connecting to MongoDB:', err);
        process.exit(1); // Exit process on MongoDB connection error
    });

function startScheduler() {
    const task = cron.schedule('0 0 * * *', async () => {
        console.log('Running weather data fetch task...');
        try {
            await fetchWeatherData('EG');
            console.log('Weather data fetched successfully');
        } catch (error) {
            console.error('Error fetching weather data:', error);
        }
    });
    console.log('Weather data fetch scheduler started');
    task.start();
}
