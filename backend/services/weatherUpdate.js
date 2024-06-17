const axios = require('axios');
const City = require('../models/City');
const Weather = require('../models/Weather');
const dotenv = require('dotenv');

dotenv.config();

const fetchWeatherData = async (countryCode) => {
    const apiKey = process.env.OWM_API_KEY;

    try {
        const cities = await City.find({ country: countryCode }); 

        // Iterate over cities in batches (adjust batchSize as needed)
        const batchSize = 19;
        for (let i = 0; i < cities.length; i += batchSize) {
            const batchCities = cities.slice(i, i + batchSize);
            const cityIds = batchCities.map(city => city.id).join(',');

            // Fetch current weather data
            const weatherUrl = `http://api.openweathermap.org/data/2.5/group?id=${cityIds}&appid=${apiKey}`;
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

            // Fetch forecast data
            const forecastUrl = `http://api.openweathermap.org/data/2.5/forecast?id=${cityIds}&appid=${apiKey}`;
            const forecastResponse = await axios.get(forecastUrl);
            const forecastData = forecastResponse.data.list;

            // Store or update forecast data in MongoDB for each city
            for (const data of forecastData) {
                const city = batchCities.find(c => c.id === data.id);
                if (city) {
                    await Weather.findOneAndUpdate(
                        { city: city._id },
                        {
                            $push: {
                                forecast: {
                                    temp: data.main.temp,
                                    humidity: data.main.humidity,
                                    windSpeed: data.wind.speed,
                                    description: data.weather[0].description,
                                    icon: data.weather[0].icon,
                                    timestamp: new Date(data.dt * 1000),
                                }
                            }
                        },
                        { upsert: true }
                    );
                }
            }
        }

        console.log(`Weather data fetch completed successfully for Egypt`);
    } catch (error) {
        console.error(`Error fetching weather data for Egypt:`, error);
    }
};

module.exports = fetchWeatherData;
