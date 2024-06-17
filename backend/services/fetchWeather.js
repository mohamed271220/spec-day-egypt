const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const fetchWeather = async (location) => {
    const apiKey = process.env.OWM_API_KEY;
    
    // Fetch current weather data
    const weatherUrl = `http://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`;
    const forecastUrl = `http://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${apiKey}&units=metric`;

    try {
        const [weatherResponse, forecastResponse] = await Promise.all([
            axios.get(weatherUrl),
            axios.get(forecastUrl)
        ]);

        const weatherData = weatherResponse.data;
        const forecastData = forecastResponse.data.list;

        return {
            current: {
                temp: weatherData.main.temp,
                humidity: weatherData.main.humidity,
                windSpeed: weatherData.wind.speed,
                description: weatherData.weather[0].description,
                icon: weatherData.weather[0].icon,
                timestamp: new Date(weatherData.dt * 1000),
            },
            forecast: forecastData.map(data => ({
                temp: data.main.temp,
                humidity: data.main.humidity,
                windSpeed: data.wind.speed,
                description: data.weather[0].description,
                icon: data.weather[0].icon,
                timestamp: new Date(data.dt * 1000),
            }))
        };
    } catch (error) {
        console.error('Error fetching weather data:', error);
        throw error;
    }
};

module.exports = fetchWeather;
