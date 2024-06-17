const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const City = require('../models/City');
const Weather = require('../models/Weather');

dotenv.config();

const fetchWeatherData = async () => {
    const apiKey = process.env.OWM_API_KEY;

    // Fetch city IDs from the database
    const cities = await City.find({});
    const cityIds = cities.map(city => city.id);

    // Batch fetch weather data
    for (let i = 0; i < cityIds.length; i += 20) {
        const batch = cityIds.slice(i, i + 20).join(',');
        const weatherUrl = `http://api.openweathermap.org/data/2.5/group?id=${batch}&appid=${apiKey}`;

        try {
            const response = await axios.get(weatherUrl);
            const weatherData = response.data.list;

            // Store or update weather data in MongoDB
            for (const data of weatherData) {
                const city = await City.findOne({ id: data.id });

                const hourlyForecastUrl = `http://api.openweathermap.org/data/2.5/forecast?id=${data.id}&appid=${apiKey}`;
                const hourlyForecastResponse = await axios.get(hourlyForecastUrl);
                const hourlyForecast = hourlyForecastResponse.data.list.map(forecast => ({
                    temp: forecast.main.temp,
                    humidity: forecast.main.humidity,
                    windSpeed: forecast.wind.speed,
                    description: forecast.weather[0].description,
                    icon: forecast.weather[0].icon,
                    timestamp: new Date(forecast.dt * 1000),
                }));

                const dailyForecastUrl = `http://api.openweathermap.org/data/2.5/forecast/daily?id=${data.id}&cnt=7&appid=${apiKey}`;
                const dailyForecastResponse = await axios.get(dailyForecastUrl);
                const dailyForecast = dailyForecastResponse.data.list.map(forecast => ({
                    minTemp: forecast.temp.min,
                    maxTemp: forecast.temp.max,
                    humidity: forecast.humidity,
                    windSpeed: forecast.speed,
                    description: forecast.weather[0].description,
                    icon: forecast.weather[0].icon,
                    timestamp: new Date(forecast.dt * 1000),
                }));

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
                            timestamp: new Date(),
                        },
                        hourly: hourlyForecast,
                        daily: dailyForecast,
                    },
                    { upsert: true }
                );
            }
        } catch (error) {
            console.error('Error fetching weather data:', error);
        }
    }

    mongoose.disconnect();
};

if (require.main === module) {
    mongoose.connect(process.env.MONGO_DB, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => {
            console.log('MongoDB connected');
            return fetchWeatherData();
        })
        .then(() => {
            console.log('Weather data fetched successfully');
        })
        .catch(err => {
            console.error('Error:', err);
        });
}

module.exports = fetchWeatherData;
