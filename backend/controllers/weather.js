const Weather = require('../models/Weather');
const City = require('../models/City');

exports.getCityWeather = async (req, res, next) => {
    const { city } = req.params;
    try {
        const weatherData = await Weather.findOne({ city: city }).populate('city');
        res.json(weatherData);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching weather data' });
    }
};

exports.getCitiesByCountryCode = async (req, res, next) => {
    const { countryCode } = req.params;
    try {
        const cities = await City.find({ country: countryCode.toUpperCase() });

        if (!cities || cities.length === 0) {
            return res.status(404).json({ message: 'No cities found for the specified country code' });
        }

        res.json(cities);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching cities data', error });
    }
};

exports.getAllCitiesWithWeather = async (req, res, next) => {
    const { search } = req.query;
    try {
        let citiesQuery = {};
        if (search) {
            citiesQuery = { name: new RegExp(search, 'i') };
        }

        const cities = await City.find(citiesQuery);
        if (!cities || cities.length === 0) {
            return res.status(404).json({ message: 'No cities found' });
        }

        const citiesWithWeather = await Promise.all(cities.map(async city => {
            const weather = await Weather.findOne({ city: city._id }, 'current');
            return {
                city: city.name,
                country: city.country,
                weather: weather ? weather.current : null
            };
        }));

        res.json(citiesWithWeather);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching cities and weather data', error });
    }
};
