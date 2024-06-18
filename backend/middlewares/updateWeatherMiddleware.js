const City = require("../models/City");
const Weather = require('../models/Weather');
const fetchWeather = require('../services/fetchWeather');

const updateWeatherMiddleware = async (req, res, next) => {
    try {
        const { city, countryCode } = req.params;
        const { lat, lon } = req.query;

        const fetchAndUpdateWeather = async (cityDocId, cityDbId) => {
            const weatherData = await fetchWeather(cityDocId);
            await Weather.findOneAndUpdate(
                { city: cityDbId },
                {
                    $set: {
                        current: weatherData.current,
                        hourly: weatherData.forecast
                    }
                },
                { upsert: true }
            );
        };

        if (lat && lon) {
            const cityDoc = await City.findOne({ 'coord.lat': parseFloat(lat), 'coord.lon': parseFloat(lon) });
            if (!cityDoc) {
                return res.status(404).json({ message: 'City not found for the specified location' });
            }
            await fetchAndUpdateWeather(cityDoc.id, cityDoc._id);
        } else if (city) {
            let cityDocId;
            if (typeof city === 'string') {
                const cityDoc = await City.findOne({ '_id': city });
                if (!cityDoc) {
                    return res.status(404).json({ message: 'City not found' });
                }
                cityDocId = cityDoc.id;
            } else {
                cityDocId = city;
            }
            try {
                await fetchAndUpdateWeather(cityDocId, city);
            } catch (error) {
                // Handle fetchWeather error
                console.error('Error fetching weather data:', error);
                return res.status(500).json({ message: 'Failed to fetch weather data', error: error.message });
            }
        } else if (countryCode) {
            const cities = await City.find({ country: countryCode.toUpperCase() });
            await Promise.all(cities.map(async (city) => {
                try {
                    const weatherData = await fetchWeather(city.id);
                    await Weather.findOneAndUpdate(
                        { city: city._id },
                        {
                            $set: {
                                current: weatherData.current,
                                hourly: weatherData.forecast
                            }
                        },
                        { upsert: true }
                    );
                } catch (error) {
                    console.error(`Error fetching weather data for city ${city.name}:`, error);
                }
            }));
        }

        next();
    } catch (error) {
        console.error('Error updating weather data:', error);
        res.status(500).json({ message: 'Failed to update weather data', error });
    }
};

module.exports = updateWeatherMiddleware;
