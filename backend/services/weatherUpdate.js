const axios = require('axios');
const City = require('../models/City');
const Weather = require('../models/Weather');
const dotenv = require('dotenv');

dotenv.config();

const fetchWeatherData = async (countryCode) => {
    const apiKey = process.env.OWM_API_KEY;

    try {
        // Fetch cities from the database for the specified country
        const cities = await City.find({ country: countryCode });

        // Iterate over cities in batches (adjust batchSize as needed)
        const batchSize = 19;
        for (let i = 0; i < cities.length; i += batchSize) {
            const batchCities = cities.slice(i, i + batchSize);
            const cityIds = batchCities.map(city => city.id).join(',');

            // Fetch current weather data
            const weatherUrl = `http://api.openweathermap.org/data/2.5/group?id=${cityIds}&appid=${apiKey}&units=metric`;
            const response = await axios.get(weatherUrl);
            const weatherData = response.data.list;

            // Store or update current weather data in MongoDB for each city
            for (const data of weatherData) {
                const city = batchCities.find(c => c.id === data.id);
                if (city) {
                    await Weather.findOneAndUpdate(
                        { city: city._id },
                        {
                            city: city._id,
                            current: {
                                temp: data.main.temp,
                                humidity: data.main.humidity,
                                windSpeed: data.wind.speed,
                                description: data.weather[0].description,
                                icon: data.weather[0].icon,
                                timestamp: new Date(data.dt * 1000),
                            },
                        },
                        { upsert: true }
                    );
                }
            }

            // Fetch forecast data for each city individually
            for (const city of batchCities) {
                const forecastUrl = `http://api.openweathermap.org/data/2.5/forecast?id=${city.id}&appid=${apiKey}&units=metric`;
                const forecastResponse = await axios.get(forecastUrl);
                const forecastData = forecastResponse.data.list;

                // Store or update forecast data in MongoDB for each city
                await Weather.findOneAndUpdate(
                    { city: city._id },
                    {
                        $set: {
                            hourly: forecastData.map(data => ({
                                temp: data.main.temp,
                                humidity: data.main.humidity,
                                windSpeed: data.wind.speed,
                                description: data.weather[0].description,
                                icon: data.weather[0].icon,
                                timestamp: new Date(data.dt * 1000),
                            }))
                        },
                    },
                    { upsert: true }
                );
            }
        }

        console.log(`Weather data fetch completed successfully for ${countryCode}`);
    } catch (error) {
        console.error(`Error fetching weather data for ${countryCode}:`, error);
    }
};

module.exports = fetchWeatherData;
