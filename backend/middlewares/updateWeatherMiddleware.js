const City = require("../models/City")
const Weather = require('../models/Weather');
const fetchWeather = require('../services/fetchWeather'); // Assuming you have a weather fetching service


// Middleware to update weather data (current and forecast) before sending response
const updateWeatherMiddleware = async (req, res, next) => {
    try {
        const { city, countryCode } = req.params;

        // Fetch updated weather data (current and forecast) based on the request parameters
        if (city) {
            const weatherData = await fetchWeather(city);
            // Update or create Weather document for the city
            await Weather.findOneAndUpdate(
                { city: city },
                {
                    $set: {
                        current: weatherData.current,
                        hourly: weatherData.forecast
                    }
                },
                { upsert: true }
            );
        } else if (countryCode) {
            // Fetch all cities for the country code
            const cities = await City.find({ country: countryCode.toUpperCase() });
            // Fetch weather data (current and forecast) for each city and update/create Weather documents
            await Promise.all(cities.map(async (city) => {
                const weatherData = await fetchWeather(city.name);
                await Weather.findOneAndUpdate(
                    { city: city.name },
                    {
                        $set: {
                            current: weatherData.current,
                            hourly: weatherData.forecast
                        }
                    },
                    { upsert: true }
                );
            }));
        }

        // Continue to the route handler
        next();
    } catch (error) {
        console.error('Error updating weather data:', error);
        res.status(500).json({ message: 'Failed to update weather data' });
    }
};

module.exports = updateWeatherMiddleware;
